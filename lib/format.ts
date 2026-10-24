const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Paris" });

function lireDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value: string | null | undefined): string {
  const d = lireDate(value);
  return d ? dateFormatter.format(d) : "";
}

const partiesFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Paris" });
const moisLongFormatter = new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "Europe/Paris" });

export type Feuillet = { jourSemaine: string; quantieme: string; mois: string; moisLong: string; annee: string };

// Une date découpée comme une page d'éphéméride : bandeau du mois, grand quantième.
export function feuillet(value: string | null | undefined): Feuillet | null {
  const d = lireDate(value);
  if (!d) return null;
  const p = Object.fromEntries(partiesFormatter.formatToParts(d).map((x) => [x.type, x.value]));
  return { jourSemaine: p.weekday, quantieme: p.day, mois: p.month, moisLong: moisLongFormatter.format(d), annee: p.year };
}

// Date de référence d'un élément : publication si connue, sinon collecte.
export function referenceDate(item: { datePublication: string | null; dateCollecte: string }): string {
  return item.datePublication ?? item.dateCollecte;
}

function joursEntre(de: string, a: string): number {
  return Math.round((new Date(`${a}T12:00:00`).getTime() - new Date(`${de}T12:00:00`).getTime()) / 86_400_000);
}

export type Ecart = { nombre: number; unite: string; futur: boolean };

// Écart entre aujourd'hui et une date, dans l'unité la plus lisible : jours sous 45 jours, puis mois, puis années.
export function ecart(today: string, date: string): Ecart {
  const j = joursEntre(today, date);
  const abs = Math.abs(j);
  const [nombre, unite] = abs < 45 ? [abs, abs > 1 ? "jours" : "jour"] : abs < 730 ? [Math.round(abs / 30.4), "mois"] : [Math.round(abs / 365), "ans"];
  return { nombre, unite, futur: j >= 0 };
}

// Écart lisible : « dans 12 jours », « il y a 3 mois ».
export function compteARebours(today: string, date: string): string {
  const e = ecart(today, date);
  if (e.nombre === 0) return "aujourd'hui";
  return `${e.futur ? "dans" : "il y a"} ${e.nombre} ${e.unite}`;
}

export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

// Couleurs par pilier (mêmes teintes que dans Notion).
const PILIER_STYLES: Record<string, string> = {
  "Data gouvernance": "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  IA: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  "Assurance de personnes": "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  Transverse: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
};

export function pilierStyle(pilier: string): string {
  return PILIER_STYLES[pilier] ?? PILIER_STYLES.Transverse;
}

const PILIER_BARS: Record<string, string> = {
  "Data gouvernance": "bg-blue-500",
  IA: "bg-violet-500",
  "Assurance de personnes": "bg-orange-500",
  Transverse: "bg-zinc-500",
};

export function pilierBar(pilier: string): string {
  return PILIER_BARS[pilier] ?? PILIER_BARS.Transverse;
}

export function slugify(texte: string): string {
  return texte
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Couleurs par réglementation (mêmes teintes que dans Notion).
const REGLEMENTATION_STYLES: Record<string, { pastille: string; point: string }> = {
  "AI Act": { pastille: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200", point: "bg-violet-500" },
  DORA: { pastille: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200", point: "bg-blue-500" },
  RGPD: { pastille: "bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-200", point: "bg-pink-500" },
  "Solvabilité II": { pastille: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200", point: "bg-amber-500" },
  "Protection sociale complémentaire": { pastille: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200", point: "bg-orange-500" },
  Santé: { pastille: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200", point: "bg-emerald-500" },
  DSP3: { pastille: "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200", point: "bg-teal-500" },
  RSP1: { pastille: "bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200", point: "bg-cyan-500" },
};
const REGLEMENTATION_DEFAUT = { pastille: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200", point: "bg-zinc-500" };

export function reglementationStyle(nom: string | null) {
  return (nom && REGLEMENTATION_STYLES[nom]) || REGLEMENTATION_DEFAUT;
}
