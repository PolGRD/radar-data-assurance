"""Collecteur quotidien (lot 2).

1. Découverte : pour chaque source avec une « URL du site » mais sans « Flux RSS »,
   cherche le flux et l'inscrit dans Notion (la source reste inactive tant qu'on ne coche pas « Active »).
2. Collecte : pour chaque source active avec un flux, crée les nouveaux articles dans Veille,
   au statut « À trier », avec l'extrait et les piliers ou tags suggérés par mots-clés.
   Un article qui ne correspond à aucun pilier n'est pas créé, sauf si la source est cochée « Tout garder ».
3. Met à jour « Dernière collecte » et « Erreurs consécutives » de chaque source.
4. Péremption : met à la corbeille les articles « À trier » jamais triés et les « Écarté » anciens.

Usage : python collecteur/collecte.py [--simulation]
Avec --simulation, rien n'est écrit dans Notion : le script affiche ce qu'il ferait.
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import date, datetime, timedelta, timezone

import notion as n
from classement import Classeur
from flux import decouvrir_flux, lire_flux, normaliser_url, telecharger

VEILLE = "0e0d1142-dd37-485c-9b9a-5a81297fe05a"
SOURCES = "bf49b3d4-9111-41db-a4da-53ff30b10dec"

AGE_MAX_JOURS = 7       # on ignore les articles plus anciens (évite d'inonder « À trier »)
MAX_PAR_SOURCE = 5      # plafond d'articles créés par source et par passage
PEREMPTION_A_TRIER = 21  # jours après la collecte, pour un article jamais trié
PEREMPTION_ECARTE = 30   # jours après la dernière modification, pour un article écarté


class Rapport:
    def __init__(self):
        self.lignes: list[str] = []

    def __call__(self, ligne: str = ""):
        print(ligne)
        self.lignes.append(ligne)

    def publier(self):
        chemin = os.environ.get("GITHUB_STEP_SUMMARY")
        if chemin:
            with open(chemin, "a", encoding="utf-8") as f:
                f.write("\n".join(self.lignes) + "\n")


def decouvrir(api: n.Notion, sources: list[dict], simulation: bool, log: Rapport):
    # Une source marquée « Manuel » n'est plus cherchée : vider « Méthode » dans Notion pour relancer la recherche.
    a_chercher = [
        s for s in sources
        if n.lire_url(s, "URL du site") and not n.lire_url(s, "Flux RSS") and n.lire_select(s, "Méthode") != "Manuel"
    ]
    if not a_chercher:
        return
    log("## Découverte des flux RSS")
    for s in a_chercher:
        nom = n.lire_texte(s, "Nom")
        trouve, raison = decouvrir_flux(n.lire_url(s, "URL du site"))
        if trouve:
            log(f"- {nom} : flux trouvé {trouve}")
            s["properties"]["Flux RSS"] = {"url": trouve}
            if not simulation:
                api.modifier_page(s["id"], {"Flux RSS": n.url(trouve), "Méthode": n.select("RSS")})
        else:
            log(f"- {nom} : aucun flux trouvé ({raison}), source passée en « Manuel »")
            if not simulation and not n.lire_select(s, "Méthode"):
                api.modifier_page(s["id"], {"Méthode": n.select("Manuel")})
    log()


def trier_articles(articles: list[dict], *, deja_vues: set[str], date_limite: str, classeur: Classeur,
                   tout_garder: bool, maximum: int = MAX_PAR_SOURCE) -> tuple[list[dict], int]:
    """Choisit les articles d'un flux à créer dans Notion.

    Renvoie les articles gardés (complétés de leurs piliers et tags) et le nombre d'articles hors sujet,
    c'est-à-dire sans aucun pilier reconnu, que l'on ne crée pas sauf pour une source « Tout garder ».
    Met à jour deja_vues avec les articles gardés.
    """
    gardes, hors_sujet = [], 0
    for a in articles:
        cle = normaliser_url(a["url"])
        if cle in deja_vues or (a["date"] and a["date"] < date_limite):
            continue
        piliers, tags = classeur.classer(a["titre"], a["extrait"])
        if not piliers and not tout_garder:
            hors_sujet += 1
            continue
        if len(gardes) >= maximum:
            break
        deja_vues.add(cle)
        gardes.append({**a, "piliers": piliers, "tags": tags})
    return gardes, hors_sujet


def a_mettre_a_la_corbeille(pages: list[dict], maintenant: datetime) -> list[str]:
    """Articles à périmer : « À trier » collectés il y a plus de 21 jours, « Écarté » sans modification depuis 30 jours.

    Les articles retenus ou lus ne sont jamais concernés.
    """
    def age(horodatage: str) -> float:
        return (maintenant - datetime.fromisoformat(horodatage.replace("Z", "+00:00"))).total_seconds() / 86400

    ids = []
    for p in pages:
        statut = n.lire_select(p, "Statut")
        if (statut == "À trier" and age(p["created_time"]) > PEREMPTION_A_TRIER) or \
           (statut == "Écarté" and age(p["last_edited_time"]) > PEREMPTION_ECARTE):
            ids.append(p["id"])
    return ids


def perimer(api: n.Notion, simulation: bool, log: Rapport):
    pages = api.interroger(VEILLE, {"or": [{"property": "Statut", "select": {"equals": s}} for s in ("À trier", "Écarté")]})
    ids = a_mettre_a_la_corbeille(pages, datetime.now(timezone.utc))
    log("## Péremption")
    log(f"{len(ids)} article(s) mis à la corbeille (À trier depuis plus de {PEREMPTION_A_TRIER} jours, "
        f"Écarté depuis plus de {PEREMPTION_ECARTE} jours). Restaurables 30 jours depuis la corbeille de Notion.")
    if not simulation:
        for i in ids:
            api.mettre_a_la_corbeille(i)
    log()


def collecter(api: n.Notion, sources: list[dict], simulation: bool, log: Rapport) -> int:
    actives = [s for s in sources if n.lire_case(s, "Active") and n.lire_url(s, "Flux RSS")]
    log("## Collecte")
    if not actives:
        log("Aucune source active avec un flux RSS : coche « Active » dans la base Sources.")
        return 0

    deja_vues = {normaliser_url(n.lire_url(p, "URL")) for p in api.interroger(VEILLE)}
    deja_vues.discard("")
    classeur = Classeur()
    limite = (date.today() - timedelta(days=AGE_MAX_JOURS)).isoformat()
    maintenant = datetime.now(timezone.utc).isoformat(timespec="seconds")
    total = 0

    for s in actives:
        nom = n.lire_texte(s, "Nom")
        erreurs = int(n.lire_nombre(s, "Erreurs consécutives"))
        try:
            articles = lire_flux(telecharger(n.lire_url(s, "Flux RSS")).content)
        except Exception as exc:
            erreurs += 1
            log(f"- **{nom}** : échec ({exc.__class__.__name__}: {str(exc)[:150]}), {erreurs} échec(s) de suite")
            if not simulation:
                api.modifier_page(s["id"], {"Erreurs consécutives": n.nombre(erreurs)})
            continue

        gardes, hors_sujet = trier_articles(
            articles, deja_vues=deja_vues, date_limite=limite, classeur=classeur, tout_garder=n.lire_case(s, "Tout garder"),
        )
        crees, lignes = len(gardes), []
        for a in gardes:
            piliers, tags = a["piliers"], a["tags"]
            lignes.append(f"  - {a['titre']}" + (f" [{', '.join(piliers + tags)}]" if piliers or tags else ""))
            if not simulation:
                api.creer_page(VEILLE, {
                    "Titre": n.titre(a["titre"]),
                    "URL": n.url(a["url"]),
                    "Source": n.relation([s["id"]]),
                    "Date de publication": n.date(a["date"]),
                    "Extrait": n.texte(a["extrait"]),
                    "Piliers": n.multi(piliers),
                    "Tags": n.multi(tags),
                    "Statut": n.select("À trier"),
                })
        total += crees
        log(f"- **{nom}** : {crees} nouvel(s) article(s) sur {len(articles)} dans le flux"
            + (f", {hors_sujet} hors sujet ignoré(s)" if hors_sujet else ""))
        for ligne in lignes:
            log(ligne)
        if not simulation:
            api.modifier_page(s["id"], {
                "Dernière collecte": n.date(maintenant),
                "Erreurs consécutives": n.nombre(0),
            })
    log()
    log(f"**Total : {total} article(s) ajouté(s) dans « À trier ».**")
    return total


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--simulation", action="store_true", help="n'écrit rien dans Notion")
    args = parser.parse_args()

    token = os.environ.get("NOTION_TOKEN")
    if not token:
        print("NOTION_TOKEN n'est pas défini (secret GitHub manquant ?).", file=sys.stderr)
        return 1

    log = Rapport()
    log(f"# Collecte du {date.today().strftime('%d/%m/%Y')}" + (" (simulation, rien n'est écrit)" if args.simulation else ""))
    log()
    api = n.Notion(token)
    sources = api.interroger(SOURCES)
    decouvrir(api, sources, args.simulation, log)
    collecter(api, sources, args.simulation, log)
    perimer(api, args.simulation, log)
    log.publier()
    return 0


if __name__ == "__main__":
    sys.exit(main())
