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
