"""Lecture des flux RSS/Atom, découverte automatique des flux et normalisation des URL."""

from __future__ import annotations

import html
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit

import feedparser
import requests

USER_AGENT = "RadarDataAssurance/1.0 (veille personnelle; +https://radar-data-assurance.vercel.app)"
TIMEOUT = 20
EXTRAIT_MAX = 300

# Paramètres de suivi retirés avant comparaison des URL.
PARAMS_SUIVI = re.compile(r"^(utm_\w+|xtor|xtref|at_\w+|fbclid|gclid|mc_cid|mc_eid|ref|source)$", re.I)

# Chemins essayés quand la page d'accueil ne déclare pas de flux.
CHEMINS_COURANTS = ["/feed", "/feed/", "/rss", "/rss.xml", "/fr/rss.xml", "/feed.xml", "/atom.xml", "/index.xml", "/?feed=rss2"]


def normaliser_url(url: str) -> str:
    """Forme canonique d'une URL, utilisée comme clé de dédoublonnage."""
    url = (url or "").strip()
    if not url:
        return ""
    parts = urlsplit(url)
    host = parts.netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    query = urlencode(sorted((k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True) if not PARAMS_SUIVI.match(k)))
    path = parts.path.rstrip("/") or "/"
    return urlunsplit(("https", host, path, query, ""))


def telecharger(url: str) -> requests.Response:
    reponse = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT)
    reponse.raise_for_status()
    return reponse


def _nettoyer(texte: str) -> str:
    texte = re.sub(r"<[^>]+>", " ", texte or "")
    texte = re.sub(r"\s+", " ", html.unescape(texte)).strip()
    return texte


def extrait(texte: str, limite: int = EXTRAIT_MAX) -> str:
    texte = _nettoyer(texte)
    if len(texte) <= limite:
        return texte
    coupe = texte[:limite].rsplit(" ", 1)[0].rstrip(" ,;:.")
    return coupe + "…"


def _date(entree) -> str | None:
    for champ in ("published_parsed", "updated_parsed"):
        valeur = entree.get(champ)
        if valeur:
            return datetime(*valeur[:6], tzinfo=timezone.utc).date().isoformat()
    return None


def lire_flux(contenu: bytes) -> list[dict]:
    """Articles d'un flux : titre, url, date (AAAA-MM-JJ ou None), extrait."""
    flux = feedparser.parse(contenu)
    if flux.bozo and not flux.entries:
        raise ValueError(f"flux illisible ({flux.get('bozo_exception')})")
    articles = []
    for e in flux.entries:
        lien = e.get("link") or ""
        titre = _nettoyer(e.get("title") or "")
        if not lien or not titre:
            continue
        resume = e.get("summary") or ""
        if not resume and e.get("content"):
            resume = e["content"][0].get("value", "")
        articles.append({"titre": titre[:2000], "url": lien, "date": _date(e), "extrait": extrait(resume)})
    return articles


class _LiensFlux(HTMLParser):
    def __init__(self):
        super().__init__()
        self.liens: list[str] = []

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "link" and "alternate" in a.get("rel", "").lower() and any(
            t in a.get("type", "").lower() for t in ("rss", "atom")
        ):
            if a.get("href"):
                self.liens.append(a["href"])


def _est_un_flux(url: str) -> bool:
    try:
        return bool(lire_flux(telecharger(url).content))
    except Exception:
        return False


def decouvrir_flux(url_site: str) -> str | None:
    """Cherche le flux RSS d'un site : balises <link> de la page d'accueil, puis chemins courants."""
    candidats: list[str] = []
    try:
        page = telecharger(url_site)
        analyseur = _LiensFlux()
        analyseur.feed(page.text)
        candidats += [urljoin(page.url, lien) for lien in analyseur.liens]
    except Exception:
        pass
    base = "{0.scheme}://{0.netloc}".format(urlsplit(url_site))
    candidats += [base + chemin for chemin in CHEMINS_COURANTS]
    vus = set()
    for candidat in candidats:
        if candidat in vus:
            continue
        vus.add(candidat)
        if _est_un_flux(candidat):
            return candidat
    return None
