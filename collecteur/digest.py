"""Digest hebdomadaire de la veille, envoyé par e-mail le lundi matin (lot 4).

Lit Notion, compose le message à partir d'un gabarit (aucune IA) et l'envoie avec Resend.

    python collecteur/digest.py --apercu digest.html   # écrit le message sans l'envoyer
    python collecteur/digest.py                        # envoie le message

Variables d'environnement : NOTION_TOKEN, et pour l'envoi RESEND_API_KEY et DIGEST_TO.
"""

from __future__ import annotations

import argparse
import html
import os
import re
import sys
import unicodedata
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

import requests

import notion as n

VEILLE = "0e0d1142-dd37-485c-9b9a-5a81297fe05a"
SOURCES = "bf49b3d4-9111-41db-a4da-53ff30b10dec"
ECHEANCES = "4f13f344-aea7-4a81-aba6-f5a14b21e09b"
PARCOURS = "d93b2f61-5c7d-4cf1-8943-012d5a2445dd"
IMPACTS = "64eabb90-48fe-4ad4-ac2d-97b2b85b7bb5"

SITE = "https://radar-data-assurance.vercel.app"
EXPEDITEUR = "Radar Data Assurance <onboarding@resend.dev>"
PILIERS = ["Data gouvernance", "IA", "Assurance de personnes"]
VISIBLES = ("Retenu", "Lu")
HORIZON_JOURS = 60
SEUIL_ERREURS = 3  # une source en échec trois jours de suite est signalée

MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
        "septembre", "octobre", "novembre", "décembre"]


@dataclass
class Article:
    id: str
    titre: str
    url_source: str
    piliers: list[str]
    pertinence: int | None
    favori: bool
    resume: str
    analyse: str


@dataclass
class Echeance:
    slug: str
    intitule: str
    date: date
    reglementation: str
    statut: str


@dataclass
class Donnees:
    articles: list[Article]          # retenus ou lus, modifiés dans les 7 derniers jours
    a_trier: int
    echeances: list[Echeance]        # toutes les échéances datées ; le gabarit garde les 60 prochains jours
    parcours: list[str]              # compétences « En cours »
    sources_en_erreur: list[str]
    a_analyser: list[Article]        # retenus ou lus dont l'analyse d'impact est vide ou « À faire »
    impacts_a_relire: int


@dataclass
class Message:
    sujet: str
    html: str
    texte: str


# --- Ancres de la frise -------------------------------------------------------------

def ancre(intitule: str) -> str:
    """Même résultat que slugify() dans lib/format.ts, pour que les liens ouvrent la bonne carte."""
    sans_accents = "".join(c for c in unicodedata.normalize("NFKD", intitule) if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", sans_accents.lower()).strip("-")[:80]


# --- Lecture de Notion --------------------------------------------------------------

def _article(page: dict) -> Article:
    pertinence = n.lire_select(page, "Pertinence")
    piliers = [o["name"] for o in (page["properties"].get("Piliers") or {}).get("multi_select", [])]
    return Article(
        id=page["id"],
        titre=n.lire_texte(page, "Titre") or "Sans titre",
        url_source=n.lire_url(page, "URL"),
        piliers=piliers,
        pertinence=int(pertinence) if pertinence.isdigit() else None,
        favori=n.lire_case(page, "Favori"),
        resume=n.lire_texte(page, "Résumé"),
        analyse=n.lire_select(page, "Analyse d'impact"),
    )


def _date(page: dict, nom: str) -> date | None:
    valeur = ((page["properties"].get(nom) or {}).get("date") or {}).get("start")
    return date.fromisoformat(valeur[:10]) if valeur else None


def lire(api: n.Notion, maintenant: datetime) -> Donnees:
    statut_parmi = lambda *s: {"or": [{"property": "Statut", "select": {"equals": v}} for v in s]}  # noqa: E731

    veille = api.interroger(VEILLE, statut_parmi(*VISIBLES, "À trier"))
    visibles = [p for p in veille if n.lire_select(p, "Statut") in VISIBLES]
    depuis = maintenant - timedelta(days=7)
    recents = [p for p in visibles if datetime.fromisoformat(p["last_edited_time"].replace("Z", "+00:00")) >= depuis]

    # Ancres calculées dans le même ordre que le site (par date), pour départager deux intitulés identiques.
    pages_echeances = sorted(api.interroger(ECHEANCES), key=lambda p: (_date(p, "Date") is None, _date(p, "Date") or date.min))
    echeances, vues = [], set()
    for p in pages_echeances:
        intitule = n.lire_texte(p, "Intitulé") or "Sans titre"
        slug = ancre(intitule) or p["id"]
        if slug in vues:
            slug = f"{slug}-{p['id'][:6]}"
        vues.add(slug)
        if jour := _date(p, "Date"):
            echeances.append(Echeance(slug, intitule, jour, n.lire_select(p, "Réglementation"), n.lire_select(p, "Statut")))

    parcours = [n.lire_texte(p, "Compétence") for p in api.interroger(PARCOURS, {"property": "Statut", "select": {"equals": "En cours"}})
                if n.lire_select(p, "Statut") == "En cours"]
    sources = [n.lire_texte(p, "Nom") for p in api.interroger(SOURCES)
               if n.lire_case(p, "Active") and n.lire_nombre(p, "Erreurs consécutives") >= SEUIL_ERREURS]
    impacts = [p for p in api.interroger(IMPACTS, {"property": "Statut", "select": {"equals": "À relire"}})
               if n.lire_select(p, "Statut") == "À relire"]

    return Donnees(
        articles=[_article(p) for p in recents],
        a_trier=sum(1 for p in veille if n.lire_select(p, "Statut") == "À trier"),
        echeances=echeances,
        parcours=parcours,
        sources_en_erreur=sources,
        a_analyser=[a for a in map(_article, visibles) if a.analyse in ("", "À faire")],
        impacts_a_relire=len(impacts),
    )


# --- Composition du message ---------------------------------------------------------

def _jour(d: date) -> str:
    return f"{d.day}{'er' if d.day == 1 else ''} {MOIS[d.month - 1]} {d.year}"


def _pluriel(nombre: int, mot: str, suite: str = "", accorder_suite: bool = False) -> str:
    """« 2 articles retenus » accorde la suite, « 2 articles à trier » non."""
    s = "s" if nombre > 1 else ""
    return f"{nombre} {mot}{s}" + (f" {suite}{s if accorder_suite else ''}" if suite else "")


def composer(d: Donnees, aujourdhui: date) -> Message:
    une = [a for a in d.articles if a.favori or (a.pertinence or 0) >= 4]
    autres = [a for a in d.articles if a not in une]
    groupes = [(p, [a for a in autres if a.piliers[:1] == [p]]) for p in PILIERS]
    groupes.append(("Sans pilier", [a for a in autres if not a.piliers or a.piliers[0] not in PILIERS]))
    groupes = [(nom, liste) for nom, liste in groupes if liste]
    proches = sorted((e for e in d.echeances if 0 <= (e.date - aujourdhui).days <= HORIZON_JOURS), key=lambda e: e.date)

    # Le message est décrit une fois, sous forme de sections, puis rendu en texte et en HTML.
    sections: list[tuple[str, list[tuple[str, str, str]]]] = []  # (titre, [(libellé, lien, détail)])
    lien_article = lambda a: f"{SITE}/veille/{a.id}"  # noqa: E731
    if une:
        sections.append(("À la une", [(a.titre, lien_article(a), a.resume) for a in une]))
    for nom, liste in groupes:
        sections.append((nom, [(a.titre, lien_article(a), a.resume) for a in liste]))
    if not d.articles:
        sections.append(("Veille", [("Aucun article retenu cette semaine.", "", "")]))
    if proches:
        sections.append((f"Échéances des {HORIZON_JOURS} prochains jours", [
            (f"{_jour(e.date)} · {e.intitule}", f"{SITE}/calendrier#{e.slug}",
             " · ".join(x for x in (e.reglementation, e.statut if e.statut != "À venir" else "") if x))
            for e in proches]))
    if d.parcours:
        sections.append(("Parcours en cours", [(c, "", "") for c in d.parcours]))

    rappels = [(_pluriel(d.a_trier, "article", "à trier"), f"{SITE}/", "")] if d.a_trier else []
    rappels += [(f"Source en erreur depuis {SEUIL_ERREURS} jours ou plus : {s}", "", "") for s in d.sources_en_erreur]
    if d.impacts_a_relire:
        rappels.append((_pluriel(d.impacts_a_relire, "impact", "à relire"), f"{SITE}/calendrier", ""))
    rappels += [(f"Analyse d'impact à faire : {a.titre}", lien_article(a), "") for a in d.a_analyser]
    if rappels:
        sections.append(("À traiter", rappels))

    sujet = f"[Veille hebdo] Semaine du {_jour(aujourdhui)} · {_pluriel(len(d.articles), 'article', 'retenu', accorder_suite=True)}"
    return Message(sujet, _en_html(sujet, sections), _en_texte(sujet, sections))


def _en_texte(sujet: str, sections) -> str:
    lignes = [sujet]
    for titre, items in sections:
        lignes += ["", titre]
        for libelle, lien, detail in items:
            lignes.append(f"- {libelle}" + (f" ({lien})" if lien else ""))
            if detail:
                lignes.append(f"  {detail}")
    return "\n".join(lignes) + "\n"


def _en_html(sujet: str, sections) -> str:
    e = html.escape
    corps = []
    for titre, items in sections:
        lis = []
        for libelle, lien, detail in items:
            texte = f'<a href="{e(lien)}" style="color:#1d4ed8">{e(libelle)}</a>' if lien else e(libelle)
            if detail:
                texte += f'<br><span style="color:#52525b">{e(detail)}</span>'
            lis.append(f'<li style="margin:0 0 8px">{texte}</li>')
        corps.append(f'<h2 style="font-size:16px;margin:24px 0 8px">{e(titre)}</h2><ul style="padding-left:18px;margin:0">{"".join(lis)}</ul>')
    return (
        '<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#18181b;max-width:640px;margin:auto;padding:16px">'
        f'<h1 style="font-size:18px;margin:0 0 4px">{e(sujet)}</h1>'
        f'<p style="margin:0;color:#71717a"><a href="{SITE}" style="color:#71717a">{SITE.removeprefix("https://")}</a></p>'
        f'{"".join(corps)}</body></html>'
    )


# --- Envoi ----------------------------------------------------------------------------

def envoyer(cle: str, destinataire: str, message: Message) -> str:
    r = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {cle}"},
        json={"from": EXPEDITEUR, "to": [destinataire], "subject": message.sujet, "html": message.html, "text": message.texte},
        timeout=30,
    )
    if not r.ok:
        raise RuntimeError(f"Resend : {r.status_code} {r.text[:300]}")
    return r.json().get("id", "")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--apercu", metavar="FICHIER", help="écrit le message HTML dans ce fichier au lieu de l'envoyer")
    args = parser.parse_args()

    token = os.environ.get("NOTION_TOKEN")
    if not token:
        print("NOTION_TOKEN n'est pas défini.", file=sys.stderr)
        return 1
    maintenant = datetime.now(timezone.utc)
    message = composer(lire(n.Notion(token), maintenant), maintenant.date())

    resume = os.environ.get("GITHUB_STEP_SUMMARY")
    if resume:
        with open(resume, "a", encoding="utf-8") as f:
            f.write(f"## {message.sujet}\n\n```\n{message.texte}```\n")

    if args.apercu:
        with open(args.apercu, "w", encoding="utf-8") as f:
            f.write(message.html)
        print(f"Aperçu écrit dans {args.apercu}")
        return 0

    cle, destinataire = os.environ.get("RESEND_API_KEY"), os.environ.get("DIGEST_TO")
    if not cle or not destinataire:
        print("RESEND_API_KEY et DIGEST_TO doivent être définis pour envoyer le digest.", file=sys.stderr)
        return 1
    print(f"Digest envoyé : {message.sujet} (id {envoyer(cle, destinataire, message)})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
