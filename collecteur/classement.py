"""Pré-classement par mots-clés (F4) : suggère piliers et tags à partir du dictionnaire."""

from __future__ import annotations

import re
import unicodedata
from pathlib import Path

import yaml

DICTIONNAIRE = Path(__file__).with_name("mots_cles.yml")


def sans_accents(texte: str) -> str:
    decompose = unicodedata.normalize("NFKD", texte)
    return "".join(c for c in decompose if not unicodedata.combining(c))


def _normaliser(texte: str) -> str:
    # Espaces insécables et multiples ramenés à un espace simple.
    return re.sub(r"\s+", " ", sans_accents(texte)).strip()


def _motif(mot: str) -> tuple[re.Pattern[str], bool]:
    """Motif « mot entier ». Un mot-clé tout en majuscules est sensible à la casse."""
    mot = _normaliser(mot)
    sensible = mot.isupper() and any(c.isalpha() for c in mot)
    corps = r"\s+".join(re.escape(partie) for partie in mot.split(" "))
    drapeaux = 0 if sensible else re.IGNORECASE
    return re.compile(rf"(?<!\w){corps}(?!\w)", drapeaux), sensible


class Classeur:
    def __init__(self, chemin: Path = DICTIONNAIRE):
        donnees = yaml.safe_load(chemin.read_text(encoding="utf-8")) or {}
        self.actif = bool(donnees.get("actif", True))
        self.piliers = self._compiler(donnees.get("piliers") or {})
        self.tags = self._compiler(donnees.get("tags") or {})

    @staticmethod
    def _compiler(groupes: dict) -> dict[str, list[re.Pattern[str]]]:
        return {nom: [_motif(str(m))[0] for m in (mots or [])] for nom, mots in groupes.items()}

    @staticmethod
    def _trouver(texte: str, groupes: dict[str, list[re.Pattern[str]]]) -> list[str]:
        return [nom for nom, motifs in groupes.items() if any(m.search(texte) for m in motifs)]

    def classer(self, *textes: str) -> tuple[list[str], list[str]]:
        """Renvoie (piliers, tags) suggérés pour les textes donnés."""
        if not self.actif:
            return [], []
        texte = _normaliser(" ".join(t for t in textes if t))
        return self._trouver(texte, self.piliers), self._trouver(texte, self.tags)
