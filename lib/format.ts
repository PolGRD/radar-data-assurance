const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Paris" });

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(d.getTime()) ? "" : dateFormatter.format(d);
}

// Date de référence d'un élément : publication si connue, sinon collecte.
export function referenceDate(item: { datePublication: string | null; dateCollecte: string }): string {
  return item.datePublication ?? item.dateCollecte;
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
};
const REGLEMENTATION_DEFAUT = { pastille: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200", point: "bg-zinc-500" };

export function reglementationStyle(nom: string | null) {
  return (nom && REGLEMENTATION_STYLES[nom]) || REGLEMENTATION_DEFAUT;
}
