import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from classement import Classeur  # noqa: E402
from flux import extrait, lire_flux, normaliser_url  # noqa: E402

classeur = Classeur()


def test_mots_cles_accents_et_casse():
    piliers, tags = classeur.classer("La PREVOYANCE collective face à la réglementation")
    assert "Assurance de personnes" in piliers
    assert "Réglementation" in tags


def test_acronymes_seulement_en_majuscules():
    assert "IA" in classeur.classer("L'IA au service des mutuelles")[0]
    assert "IA" not in classeur.classer("Via une nouvelle plateforme")[0]
    assert "Assurance de personnes" not in classeur.classer("Ani et ses amis")[0]
    assert "Assurance de personnes" in classeur.classer("Accord ANI : ce qui change")[0]


def test_mot_entier():
    assert "Assurance de personnes" not in classeur.classer("prévoyant et organisé")[0]


def test_expression_sur_plusieurs_mots():
    assert "Data gouvernance" in classeur.classer("Améliorer la qualité  des données clients")[0]


def test_normalisation_url():
    a = normaliser_url("https://www.exemple.fr/article/?utm_source=rss&id=3#haut")
    b = normaliser_url("http://exemple.fr/article?id=3")
    assert a == b == "https://exemple.fr/article?id=3"


def test_extrait_coupe_proprement():
    texte = "<p>" + "mot " * 200 + "</p>"
    resultat = extrait(texte, 50)
    assert len(resultat) <= 51 and resultat.endswith("…") and "<" not in resultat


def test_lecture_flux_rss():
    rss = b"""<?xml version="1.0"?><rss version="2.0"><channel><title>T</title>
    <item><title>Article &amp; test</title><link>https://ex.fr/a</link>
    <pubDate>Mon, 21 Sep 2026 08:00:00 +0000</pubDate><description>&lt;b&gt;Chapo&lt;/b&gt;</description></item>
    </channel></rss>"""
    [article] = lire_flux(rss)
    assert article == {"titre": "Article & test", "url": "https://ex.fr/a", "date": "2026-09-21", "extrait": "Chapo"}


def test_entites_doublement_encodees():
    assert extrait("le jeudi 24&amp;nbsp;septembre à 9&amp;nbsp;h&amp;nbsp;30") == "le jeudi 24 septembre à 9 h 30"


def test_flux_google_actualites():
    rss = b"""<?xml version="1.0"?><rss version="2.0"><channel><title>Google</title>
    <item><title>La pr\xc3\xa9voyance en 2026 - L'Argus de l'assurance</title>
    <link>https://news.google.com/rss/articles/CBMiABC?oc=5</link>
    <pubDate>Sat, 26 Sep 2026 08:00:00 GMT</pubDate>
    <description>&lt;a href="https://news.google.com/rss/articles/CBMiABC?oc=5"&gt;La pr\xc3\xa9voyance en 2026&lt;/a&gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;L'Argus de l'assurance&lt;/font&gt;</description>
    <source url="https://www.argusdelassurance.com">L'Argus de l'assurance</source></item>
    </channel></rss>"""
    [article] = lire_flux(rss)
    assert article["titre"] == "La pr\u00e9voyance en 2026"
    assert article["extrait"] == ""
    assert article["date"] == "2026-09-26"
