const STYLE: Record<string, string> = {
  Ébauche: "border border-rule-2 text-ink-2",
  "En cours": "bg-alerte-soft text-alerte",
  Stable: "bg-prusse-soft text-prusse dark:text-ink",
};

export function StatutFiche({ statut }: { statut: string | null }) {
  if (!statut) return null;
  return <span className={`inline-block rounded-[4px] px-1.5 py-0.5 text-xs font-semibold ${STYLE[statut] ?? STYLE.Ébauche}`}>{statut}</span>;
}
