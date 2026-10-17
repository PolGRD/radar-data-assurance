"""Rationalisation de la collecte : filtre de pertinence, plafond par source et péremption."""

import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from classement import Classeur  # noqa: E402
from collecte import MAX_PAR_SOURCE, a_mettre_a_la_corbeille, trier_articles  # noqa: E402

classeur = Classeur()


def flux(*titres, date="2026-10-16"):
    return [{"titre": t, "url": f"https://ex.fr/{i}", "date": date, "extrait": ""} for i, t in enumerate(titres)]


# --- Filtre de pertinence --------------------------------------------------------------

def test_ecarte_les_articles_sans_pilier_sauf_si_la_source_est_a_tout_garder():
    articles = flux("Prévoyance collective : nouveaux accords", "Résultats trimestriels d'un courtier auto")
    gardes, hors_sujet = trier_articles(articles, deja_vues=set(), date_limite="2026-10-10", classeur=classeur, tout_garder=False)
    assert [a["titre"] for a in gardes] == ["Prévoyance collective : nouveaux accords"]
    assert gardes[0]["piliers"] == ["Assurance de personnes"]
    assert hors_sujet == 1
    gardes, hors_sujet = trier_articles(articles, deja_vues=set(), date_limite="2026-10-10", classeur=classeur, tout_garder=True)
    assert len(gardes) == 2 and hors_sujet == 0


def test_ignore_les_doublons_et_les_articles_trop_anciens():
    articles = flux("Mutuelle : déjà vue") + flux("Mutuelle : trop ancienne", date="2026-09-01")
    articles[0]["url"] = "https://www.ex.fr/deja?utm_source=rss"
    gardes, _ = trier_articles(articles, deja_vues={"https://ex.fr/deja"}, date_limite="2026-10-10", classeur=classeur, tout_garder=True)
    assert gardes == []


def test_plafonne_le_nombre_d_articles_par_source():
    articles = flux(*[f"Prévoyance : article {i}" for i in range(12)])
    gardes, _ = trier_articles(articles, deja_vues=set(), date_limite="2026-10-10", classeur=classeur, tout_garder=False)
    assert len(gardes) == MAX_PAR_SOURCE == 5


def test_tes_articles_retenus_passent_le_filtre():
    """Titres des articles retenus ou lus au 17/10/2026, collectés auprès de sources soumises au filtre.

    Exceptions assumées, faute de mot-clé propre aux trois piliers :
    « Climat : des dirigeants de l'assurance préviennent… » et
    « L'AMF et l'ACPR encouragent les professionnels… (produits d'épargne) ».
    """
    retenus = [
        ("OEMA : baromètre prospectif des métiers et compétences de l'assurance 2026", "l'intelligence artificielle reste le premier facteur de transformation"),
        ("Le principe de minimisation et les traitements du NIR et des données de santé dans l'assurance", ""),
        ("IA : la CNIL finalise ses recommandations sur le développement des systèmes d'IA", ""),
        ("L'ACPR dévoile son programme de travail pour 2026", "Supervision de l'IA, value for money et entrée en vigueur de l'IRRD"),
        ("All in the Data: The State of Data Governance in 2026", ""),
        ("Data Governance Frameworks for AI Compliance", ""),
        ("L'ACPR lance une consultation publique sur l'équité algorithmique", ""),
        ("Data Management Trends in 2026: Moving Beyond Awareness to Action", ""),
        ("Prévoyance collective : la loi Évin a-t-elle atteint ses limites ?", ""),
        ("Les montants levés par les assurtech battent des records… boostés par Alan et l’intelligence artificielle", ""),
        ("Fiscalité, utilisation des données...Les combats de la Mutualité française pour le budget de la Sécurité sociale 2027", ""),
        ("IA agentique et métiers techniques : ce que les assureurs doivent exiger", ""),
        ("AT/MP : La prévoyance impactée par la baisse du plafond des IJSS", ""),
        ("IA & RÉGLEMENTAIRE – De l’actualité aux enjeux de vos organisations", "Transparence de l’IA, articulation entre le DSA et le règlement européen sur l’IA"),
        ("[Spécial Reavie] Pourquoi la diversification en épargne des groupes de protection sociale est sous surveillance", ""),
        ("IA & RÉGLEMENTAIRE – Publication Opérationnalisation du règlement européen sur l’intelligence artificielle (RIA)", ""),
        ("IA et assurance : garder la maîtrise à mesure que les usages se développent", ""),
        ("How to Turn Data Governance into a Decision System", ""),
        ("DATAVERSITY Demo Day – Data Quality / DataOps", ""),
        ("LCB-FT : un guide pour connaître les informations, justificatifs et données personnelles que votre professionnel de l’assurance peut vous demander", ""),
        ("AI Act : comment Cleva construit des usages IA maîtrisés pour les assureurs", ""),
        ("Santé prévoyance : Gila dépose une demande d’agrément à l’ACPR", ""),
        ("Avec 11,5 milliards d’euros de cotisations en août 2026, l’assurance vie demeure un levier essentiel", ""),
    ]
    perdus = [titre for titre, extrait in retenus if not classeur.classer(titre, extrait)[0]]
    assert perdus == []


# --- Péremption ---------------------------------------------------------------------------

MAINTENANT = datetime(2026, 10, 17, 4, 0, tzinfo=timezone.utc)


def page(id, statut, cree, modifie=None):
    return {"id": id, "created_time": cree, "last_edited_time": modifie or cree,
            "properties": {"Statut": {"select": {"name": statut}}}}


def test_peremption_des_articles_a_trier_et_ecartes():
    pages = [
        page("a-trier-vieux", "À trier", "2026-09-25T04:00:00.000Z"),     # 22 jours
        page("a-trier-recent", "À trier", "2026-09-27T04:00:00.000Z"),    # 20 jours
        page("ecarte-vieux", "Écarté", "2026-09-01T04:00:00.000Z", "2026-09-16T04:00:00.000Z"),   # écarté il y a 31 jours
        page("ecarte-recent", "Écarté", "2026-09-01T04:00:00.000Z", "2026-10-01T04:00:00.000Z"),
        page("retenu-ancien", "Retenu", "2025-01-01T04:00:00.000Z"),
        page("lu-ancien", "Lu", "2025-01-01T04:00:00.000Z"),
    ]
    assert a_mettre_a_la_corbeille(pages, MAINTENANT) == ["a-trier-vieux", "ecarte-vieux"]
