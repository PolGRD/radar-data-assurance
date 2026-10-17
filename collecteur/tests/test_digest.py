"""Digest hebdomadaire : composition du message, ancres de la frise et lecture de Notion."""

import sys
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from digest import Article, Donnees, Echeance, ancre, composer, lire  # noqa: E402

LUNDI = date(2026, 10, 19)


def article(id, titre, **champs):
    base = dict(id=id, titre=titre, url_source="", piliers=[], pertinence=None, favori=False, resume="", analyse="")
    return Article(**{**base, **champs})


def donnees(**champs):
    base = dict(articles=[], a_trier=0, echeances=[], parcours=[], sources_en_erreur=[], a_analyser=[], impacts_a_relire=0)
    return Donnees(**{**base, **champs})


# --- Composition ---------------------------------------------------------------

def test_objet_prefixe_et_compte_des_articles():
    m = composer(donnees(articles=[article("a1", "A"), article("a2", "B")]), LUNDI)
    assert m.sujet.startswith("[Veille hebdo] ")
    assert "19 octobre 2026" in m.sujet
    assert "2 articles retenus" in m.sujet


def test_favoris_et_pertinence_4_a_la_une_le_reste_par_pilier():
    m = composer(donnees(articles=[
        article("fav", "Article favori", favori=True, piliers=["IA"], pertinence=2),
        article("p5", "Article essentiel", pertinence=5, piliers=["IA"]),
        article("dg", "Article data", pertinence=3, piliers=["Data gouvernance"]),
        article("ia", "Article IA", pertinence=3, piliers=["IA"]),
        article("rien", "Article sans pilier"),
    ]), LUNDI)
    texte = m.texte
    une = texte.index("À la une")
    dg = texte.index("Data gouvernance")
    ia = texte.index("\nIA")
    for titre in ("Article favori", "Article essentiel"):
        assert une < texte.index(titre) < dg
    assert dg < texte.index("Article data") < ia < texte.index("Article IA")
    assert texte.index("Sans pilier") < texte.index("Article sans pilier")
    assert texte.count("Article favori") == 1  # pas répété dans son pilier


def test_liens_vers_le_site_et_resume():
    m = composer(donnees(articles=[article("abc-123", "Plafond IJSS", resume="Le complément augmente.")]), LUNDI)
    assert "https://radar-data-assurance.vercel.app/veille/abc-123" in m.html
    assert "Le complément augmente." in m.html and "Le complément augmente." in m.texte


def test_echeances_des_60_prochains_jours_seulement():
    m = composer(donnees(echeances=[
        Echeance(slug="passee", intitule="Échéance passée", date=date(2026, 10, 1), reglementation="AI Act", statut="En vigueur"),
        Echeance(slug="ijss", intitule="IJSS AT/MP : plafond", date=date(2026, 11, 1), reglementation="Autre", statut="À venir"),
        Echeance(slug="j60", intitule="Dans 60 jours", date=date(2026, 12, 18), reglementation="DORA", statut="À venir"),
        Echeance(slug="j61", intitule="Dans 61 jours", date=date(2026, 12, 19), reglementation="DORA", statut="À venir"),
    ]), LUNDI)
    assert "IJSS AT/MP : plafond" in m.texte and "Dans 60 jours" in m.texte
    assert "Échéance passée" not in m.texte and "Dans 61 jours" not in m.texte
    assert "https://radar-data-assurance.vercel.app/calendrier#ijss" in m.html


def test_rappels_a_trier_sources_en_erreur_et_a_traiter():
    m = composer(donnees(
        a_trier=12, sources_en_erreur=["L'Argus de l'assurance"], impacts_a_relire=23,
        a_analyser=[article("m", "Mutualité française et PLFSS 2027")], parcours=["Certification DAMA CDMP"],
    ), LUNDI)
    for attendu in ("- 12 articles à trier (", "L'Argus de l'assurance", "- 23 impacts à relire (",
                    "Mutualité française et PLFSS 2027", "Certification DAMA CDMP"):
        assert attendu in m.texte, attendu


def test_accords_au_singulier_et_au_pluriel():
    un = composer(donnees(articles=[article("a", "A")], a_trier=1, impacts_a_relire=1), LUNDI)
    assert "· 1 article retenu" in un.sujet
    assert "- 1 article à trier (" in un.texte and "- 1 impact à relire (" in un.texte
    deux = composer(donnees(articles=[article("a", "A"), article("b", "B")]), LUNDI)
    assert "· 2 articles retenus" in deux.sujet


def test_le_html_echappe_les_titres():
    m = composer(donnees(articles=[article("x", "Tarifs <santé> & prévoyance")]), LUNDI)
    assert "Tarifs &lt;santé&gt; &amp; prévoyance" in m.html
    assert "<santé>" not in m.html


def test_semaine_calme():
    m = composer(donnees(), LUNDI)
    assert "Aucun article retenu cette semaine" in m.texte
    assert "0 article retenu" in m.sujet


# --- Ancres : identiques à slugify() du site (lib/format.ts) --------------------

def test_ancre_identique_au_site():
    assert ancre("AI Act : systèmes à haut risque de l'annexe III") == "ai-act-systemes-a-haut-risque-de-l-annexe-iii"
    assert ancre("IJSS AT/MP : abaissement du plafond") == "ijss-at-mp-abaissement-du-plafond"
    assert len(ancre("a" * 120)) == 80


# --- Lecture de Notion -----------------------------------------------------------

def _titre(v):
    return {"title": [{"plain_text": v}]}


def _sel(v):
    return {"select": {"name": v} if v else None}


def _multi(vs):
    return {"multi_select": [{"name": v} for v in vs]}


class FauxNotion:
    """Rend des pages au format de l'API selon la base interrogée, et mémorise les filtres reçus."""

    def __init__(self, pages):
        self.pages, self.filtres = pages, {}

    def interroger(self, data_source_id, filtre=None):
        self.filtres[data_source_id] = filtre
        return self.pages.get(data_source_id, [])


def test_lecture_de_notion():
    import digest as d
    maintenant = datetime(2026, 10, 19, 5, 30, tzinfo=timezone.utc)
    api = FauxNotion({
        d.VEILLE: [
            {"id": "recent", "last_edited_time": "2026-10-16T09:00:00.000Z", "properties": {
                "Titre": _titre("Plafond IJSS"), "Statut": _sel("Retenu"), "Piliers": _multi(["Assurance de personnes"]),
                "Pertinence": _sel("5"), "Favori": {"checkbox": False}, "Résumé": {"rich_text": []},
                "URL": {"url": "https://exemple.fr/ijss"}, "Analyse d'impact": _sel("Faite")}},
            {"id": "ancien", "last_edited_time": "2026-09-01T09:00:00.000Z", "properties": {
                "Titre": _titre("Vieux sujet"), "Statut": _sel("Lu"), "Piliers": _multi([]), "Pertinence": _sel(None),
                "Favori": {"checkbox": False}, "Résumé": {"rich_text": []}, "URL": {"url": None}, "Analyse d'impact": _sel(None)}},
            {"id": "atrier", "last_edited_time": "2026-10-18T09:00:00.000Z", "properties": {
                "Titre": _titre("Brut"), "Statut": _sel("À trier"), "Piliers": _multi([]), "Pertinence": _sel(None),
                "Favori": {"checkbox": False}, "Résumé": {"rich_text": []}, "URL": {"url": None}, "Analyse d'impact": _sel(None)}},
        ],
        d.ECHEANCES: [
            {"id": "e1", "properties": {"Intitulé": _titre("IJSS AT/MP : abaissement du plafond"),
                                        "Date": {"date": {"start": "2026-11-01"}}, "Réglementation": _sel("Autre"), "Statut": _sel("À venir")}},
            {"id": "e2", "properties": {"Intitulé": _titre("Sans date"), "Date": {"date": None},
                                        "Réglementation": _sel("Autre"), "Statut": _sel("À vérifier")}},
        ],
        d.PARCOURS: [{"id": "p1", "properties": {"Compétence": _titre("DAMA CDMP"), "Statut": _sel("En cours")}},
                     {"id": "p2", "properties": {"Compétence": _titre("AI Act"), "Statut": _sel("Fait")}}],
        d.SOURCES: [{"id": "s1", "properties": {"Nom": _titre("CNIL"), "Active": {"checkbox": True}, "Erreurs consécutives": {"number": 3}}},
                    {"id": "s2", "properties": {"Nom": _titre("ACPR"), "Active": {"checkbox": True}, "Erreurs consécutives": {"number": 1}}},
                    {"id": "s3", "properties": {"Nom": _titre("Ancienne"), "Active": {"checkbox": False}, "Erreurs consécutives": {"number": 9}}}],
        d.IMPACTS: [{"id": "i1", "properties": {"Statut": _sel("À relire")}}, {"id": "i2", "properties": {"Statut": _sel("Validé")}}],
    })
    lu = lire(api, maintenant)
    assert [a.id for a in lu.articles] == ["recent"]
    assert lu.articles[0].pertinence == 5 and lu.articles[0].url_source == "https://exemple.fr/ijss"
    assert lu.a_trier == 1
    assert [(e.slug, e.date) for e in lu.echeances] == [("ijss-at-mp-abaissement-du-plafond", date(2026, 11, 1))]
    assert lu.parcours == ["DAMA CDMP"]
    assert lu.sources_en_erreur == ["CNIL"]
    assert lu.impacts_a_relire == 1
    assert [a.id for a in lu.a_analyser] == ["ancien"]  # retenu ou lu, analyse vide ou « À faire »
