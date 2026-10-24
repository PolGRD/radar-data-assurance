// Parcours d'apprentissage : compétences rangées par pilier et par statut (page /parcours, tableau de bord).
import { PILIERS } from "./config";
import type { EtapeParcours } from "./types";

export const STATUTS_PARCOURS = ["À faire", "En cours", "Fait"] as const;
export type StatutParcours = (typeof STATUTS_PARCOURS)[number];

const ORDRE_PILIERS: string[] = [...PILIERS, "Transverse"];

export type LigneParcours = {
  pilier: string;
  faits: number;
  total: number;
  pourcentage: number;
  colonnes: Record<StatutParcours, EtapeParcours[]>;
};

const statutDe = (e: EtapeParcours): StatutParcours =>
  (STATUTS_PARCOURS as readonly string[]).includes(e.statut ?? "") ? (e.statut as StatutParcours) : "À faire";

// Échéance cible la plus proche d'abord, les compétences sans date ensuite.
function parEcheance(a: EtapeParcours, b: EtapeParcours): number {
  if (a.echeanceCible && b.echeanceCible) return a.echeanceCible.localeCompare(b.echeanceCible);
  if (a.echeanceCible || b.echeanceCible) return a.echeanceCible ? -1 : 1;
  return a.competence.localeCompare(b.competence, "fr");
}

export function tableauParcours(etapes: EtapeParcours[]): LigneParcours[] {
  const piliers = [...new Set(etapes.map((e) => e.pilier ?? "Transverse"))].sort(
    (a, b) => (ORDRE_PILIERS.indexOf(a) + 1 || 99) - (ORDRE_PILIERS.indexOf(b) + 1 || 99),
  );
  return piliers.map((pilier) => {
    const liste = etapes.filter((e) => (e.pilier ?? "Transverse") === pilier).sort(parEcheance);
    const colonnes = Object.fromEntries(STATUTS_PARCOURS.map((s) => [s, liste.filter((e) => statutDe(e) === s)])) as LigneParcours["colonnes"];
    const faits = colonnes.Fait.length;
    return { pilier, faits, total: liste.length, pourcentage: Math.round((faits / liste.length) * 100), colonnes };
  });
}

export function progression(etapes: EtapeParcours[]): { faits: number; enCours: number; total: number } {
  return {
    faits: etapes.filter((e) => statutDe(e) === "Fait").length,
    enCours: etapes.filter((e) => statutDe(e) === "En cours").length,
    total: etapes.length,
  };
}
