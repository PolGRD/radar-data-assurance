"""Accès minimal à l'API Notion (version 2025-09-03, sources de données)."""

from __future__ import annotations

import os
import time

import requests

API = os.environ.get("NOTION_API_URL", "https://api.notion.com").rstrip("/") + "/v1"
VERSION = "2025-09-03"


class Notion:
    def __init__(self, token: str):
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Notion-Version": VERSION,
            "Content-Type": "application/json",
        })

    def _appel(self, methode: str, chemin: str, corps: dict | None = None) -> dict:
        for essai in range(5):
            r = self.session.request(methode, API + chemin, json=corps, timeout=30)
            if r.status_code == 429 or r.status_code >= 500:
                time.sleep(float(r.headers.get("Retry-After", 2 ** essai)))
                continue
            if not r.ok:
                raise RuntimeError(f"Notion {methode} {chemin} : {r.status_code} {r.text[:300]}")
            time.sleep(0.35)  # l'API accepte environ 3 requêtes par seconde
            return r.json()
        raise RuntimeError(f"Notion {methode} {chemin} : trop de tentatives")

    def interroger(self, data_source_id: str, filtre: dict | None = None) -> list[dict]:
        pages, curseur = [], None
        while True:
            corps: dict = {"page_size": 100}
            if filtre:
                corps["filter"] = filtre
            if curseur:
                corps["start_cursor"] = curseur
            r = self._appel("POST", f"/data_sources/{data_source_id}/query", corps)
            pages += [p for p in r.get("results", []) if p.get("object") == "page"]
            if not r.get("has_more"):
                return pages
            curseur = r.get("next_cursor")

    def creer_page(self, data_source_id: str, proprietes: dict) -> dict:
        return self._appel("POST", "/pages", {
            "parent": {"type": "data_source_id", "data_source_id": data_source_id},
            "properties": proprietes,
        })

    def modifier_page(self, page_id: str, proprietes: dict) -> dict:
        return self._appel("PATCH", f"/pages/{page_id}", {"properties": proprietes})


# --- Lecture et écriture des valeurs de propriétés ---

def lire_texte(page: dict, nom: str) -> str:
    p = page["properties"].get(nom) or {}
    morceaux = p.get("title") or p.get("rich_text") or []
    return "".join(m.get("plain_text", "") for m in morceaux).strip()


def lire_url(page: dict, nom: str) -> str:
    return (page["properties"].get(nom) or {}).get("url") or ""


def lire_select(page: dict, nom: str) -> str:
    return ((page["properties"].get(nom) or {}).get("select") or {}).get("name") or ""


def lire_case(page: dict, nom: str) -> bool:
    return bool((page["properties"].get(nom) or {}).get("checkbox"))


def lire_nombre(page: dict, nom: str) -> float:
    return (page["properties"].get(nom) or {}).get("number") or 0


def titre(valeur: str) -> dict:
    return {"title": [{"text": {"content": valeur[:2000]}}]}


def texte(valeur: str) -> dict:
    return {"rich_text": [{"text": {"content": valeur[:2000]}}] if valeur else []}


def url(valeur: str | None) -> dict:
    return {"url": valeur or None}


def select(valeur: str) -> dict:
    return {"select": {"name": valeur}}


def multi(valeurs: list[str]) -> dict:
    return {"multi_select": [{"name": v} for v in valeurs]}


def date(valeur: str | None) -> dict:
    return {"date": {"start": valeur} if valeur else None}


def relation(ids: list[str]) -> dict:
    return {"relation": [{"id": i} for i in ids]}


def nombre(valeur: float) -> dict:
    return {"number": valeur}
