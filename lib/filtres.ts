// Filtrage et tri du fil de veille et du référentiel de règles, à partir des critères lus dans l'adresse.
// Logique pure, sans React : les composants d'affichage l'appellent, les tests aussi.
import Fuse, { type IFuseOptions } from "fuse.js";
import { referenceDate } from "./format";
import type { Regle, VeilleItem } from "./types";

export const CRITERES_VEILLE = ["pilier", "tag", "branche", "source", "type", "periode", "pertinence", "favori", "tri"] as const;
export const CRITERES_REGLES = ["branche", "domaine", "nature", "criticite", "statut", "citee"] as const;

export type CriteresVeille = Partial<Record<(typeof CRITERES_VEILLE)[number] | "q", string>>;
export type CriteresRegles = Partial<Record<(typeof CRITERES_REGLES)[number] | "q", string>>;

// Un index de recherche par liste : reconstruit seulement quand la liste change.
const index = new WeakMap<object, Fuse<unknown>>();
function rechercher<T>(liste: T[], q: string, options: IFuseOptions<T>): T[] {
  let fuse = index.get(liste) as Fuse<T> | undefined;
  if (!fuse) {
    fuse = new Fuse(liste, { threshold: 0.35, ignoreLocation: true, ignoreDiacritics: true, ...options });
    index.set(liste, fuse as Fuse<unknown>);
  }
  return fuse.search(q).map((r) => r.item);
}

const JOUR = 24 * 60 * 60 * 1000;

export function filtrerVeille(items: VeilleItem[], c: CriteresVeille, maintenant: Date = new Date()): VeilleItem[] {
  const q = c.q?.trim() ?? "";
  let liste = q
    ? rechercher(items, q, {
        keys: [
          { name: "titre", weight: 3 },
          { name: "resume", weight: 2 },
          { name: "extrait", weight: 1 },
          { name: "tags", weight: 1 },
          { name: "sources", weight: 1 },
        ],
      })
    : items;
  if (c.pilier) liste = liste.filter((i) => i.piliers.includes(c.pilier!));
  if (c.tag) liste = liste.filter((i) => i.tags.includes(c.tag!));
  if (c.branche) liste = liste.filter((i) => i.branches.includes(c.branche!));
  if (c.source) liste = liste.filter((i) => i.sources.includes(c.source!));
  if (c.type) liste = liste.filter((i) => i.type === c.type);
  if (c.pertinence) liste = liste.filter((i) => (i.pertinence ?? 0) >= Number(c.pertinence));
  if (c.favori) liste = liste.filter((i) => i.favori);
  if (c.periode) {
    const depuis = maintenant.getTime() - Number(c.periode) * JOUR;
    liste = liste.filter((i) => new Date(referenceDate(i)).getTime() >= depuis);
  }
  // Avec une recherche et sans tri demandé, on garde l'ordre de pertinence de la recherche.
  if (c.tri === "pertinence") {
    return [...liste].sort((a, b) => (b.pertinence ?? 0) - (a.pertinence ?? 0) || referenceDate(b).localeCompare(referenceDate(a)));
  }
  return q ? liste : [...liste].sort((a, b) => referenceDate(b).localeCompare(referenceDate(a)));
}

export function filtrerRegles<R extends Regle & { citations: unknown[] }>(regles: R[], c: CriteresRegles): R[] {
  const q = c.q?.trim() ?? "";
  let liste = q
    ? rechercher(regles, q, { keys: [{ name: "regle", weight: 3 }, { name: "controle", weight: 2 }, { name: "referenceJuridique", weight: 1 }] })
    : regles;
  if (c.branche) liste = liste.filter((r) => r.branches.includes(c.branche!));
  if (c.domaine) liste = liste.filter((r) => r.domaine === c.domaine);
  if (c.nature) liste = liste.filter((r) => r.nature === c.nature);
  if (c.criticite) liste = liste.filter((r) => r.criticite === c.criticite);
  if (c.statut) liste = liste.filter((r) => r.statut === c.statut);
  if (c.citee) liste = liste.filter((r) => r.citations.length > 0);
  return liste;
}
