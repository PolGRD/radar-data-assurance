"""Espace Notion plein (limite de blocs du forfait gratuit) : la collecte ne doit pas planter.

Panne du 15 et 16/11/2026 : Notion refusait toute création de page (403 restricted_resource) ;
le collecteur s'arrêtait sur une trace Python, sans péremption ni rapport.
"""

import json
import sys
from email.utils import format_datetime
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import collecte  # noqa: E402
import notion as n  # noqa: E402

REFUS_BLOCS = {
    "object": "error", "status": 403, "code": "restricted_resource",
    "message": "This workspace has used all of its free blocks. Upgrade its plan in Notion to create more content.",
    "additional_data": {"block_limit": "block_creation"},
}

SOURCE = {"id": "source-1", "created_time": "2026-01-01T00:00:00.000Z", "last_edited_time": "2026-01-01T00:00:00.000Z",
          "properties": {"Nom": {"title": [{"plain_text": "L'Argus de l'assurance"}]}, "Active": {"checkbox": True},
                         "Flux RSS": {"url": "https://exemple.fr/rss"}, "Erreurs consécutives": {"number": 0}}}
VIEIL_A_TRIER = {"id": "vieux-a-trier", "created_time": "2026-01-01T00:00:00.000Z", "last_edited_time": "2026-01-01T00:00:00.000Z",
                 "properties": {"Statut": {"select": {"name": "À trier"}}, "URL": {"url": "https://exemple.fr/ancien"}}}


class Reponse:
    def __init__(self, statut, corps):
        self.status_code, self.ok, self.headers = statut, statut < 400, {}
        self._corps, self.text = corps, json.dumps(corps)

    def json(self):
        return self._corps


class FauxServeurNotion:
    """Répond comme l'API Notion d'un espace plein : lecture et corbeille possibles, création refusée."""

    def __init__(self):
        self.appels = []

    def request(self, methode, url, json=None, timeout=None):
        chemin = url.split("/v1", 1)[1]
        self.appels.append((methode, chemin, json))
        if methode == "POST" and chemin == f"/data_sources/{collecte.SOURCES}/query":
            return Reponse(200, {"results": [{"object": "page", **SOURCE}], "has_more": False})
        if methode == "POST" and chemin == f"/data_sources/{collecte.VEILLE}/query":
            return Reponse(200, {"results": [{"object": "page", **VIEIL_A_TRIER}], "has_more": False})
        if methode == "POST" and chemin == "/pages":
            return Reponse(403, REFUS_BLOCS)
        return Reponse(200, {})


class Flux:
    def __init__(self):
        date = format_datetime(datetime.now(timezone.utc))
        self.content = f"""<?xml version="1.0"?><rss version="2.0"><channel><title>Argus</title>
          <item><title>Prévoyance collective : la DSN évolue</title><link>https://exemple.fr/nouveau</link>
          <pubDate>{date}</pubDate><description>Prévoyance et qualité des données.</description></item>
        </channel></rss>""".encode()


def lancer(monkeypatch, tmp_path):
    serveur = FauxServeurNotion()
    monkeypatch.setattr(n.time, "sleep", lambda s: None)
    monkeypatch.setattr(n.requests, "Session", lambda: type("S", (), {"headers": {}, "request": serveur.request})())
    monkeypatch.setattr(collecte, "telecharger", lambda url: Flux())
    monkeypatch.setattr(sys, "argv", ["collecte.py"])
    monkeypatch.setenv("NOTION_TOKEN", "jeton-de-test")
    resume = tmp_path / "resume.md"
    monkeypatch.setenv("GITHUB_STEP_SUMMARY", str(resume))
    code = collecte.main()
    return code, serveur, resume.read_text(encoding="utf-8") if resume.exists() else ""


def test_espace_plein_la_collecte_signale_la_limite_sans_planter(monkeypatch, tmp_path):
    code, _, resume = lancer(monkeypatch, tmp_path)
    assert code == 1  # le workflow reste en rouge pour que l'utilisateur soit prévenu
    assert "limite de blocs" in resume


def test_espace_plein_la_peremption_libere_quand_meme_de_la_place(monkeypatch, tmp_path):
    _, serveur, _ = lancer(monkeypatch, tmp_path)
    assert ("PATCH", "/pages/vieux-a-trier", {"in_trash": True}) in serveur.appels


def test_espace_plein_une_seule_tentative_de_creation(monkeypatch, tmp_path):
    _, serveur, _ = lancer(monkeypatch, tmp_path)
    assert sum(1 for m, c, _ in serveur.appels if m == "POST" and c == "/pages") == 1
