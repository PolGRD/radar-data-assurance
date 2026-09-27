const NATURE: Record<string, { style: string; titre: string }> = {
  REG: { style: "border-red-300 text-red-800 dark:border-red-800 dark:text-red-300", titre: "Réglementaire : non négociable" },
  PDT: { style: "border-blue-300 text-blue-800 dark:border-blue-800 dark:text-blue-300", titre: "Produit : dépend des conditions générales" },
  GES: { style: "border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300", titre: "Gestion : convention ou cohérence du SI" },
};
const CRITICITE: Record<string, { style: string; titre: string }> = {
  C1: { style: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200", titre: "C1 bloquant" },
  C2: { style: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200", titre: "C2 majeur" },
  C3: { style: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", titre: "C3 mineur" },
};

export function NatureBadge({ nature }: { nature: string | null }) {
  if (!nature) return null;
  const n = NATURE[nature];
  return <span title={n?.titre} className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[11px] font-semibold ${n?.style ?? ""}`}>{nature}</span>;
}

export function CriticiteBadge({ criticite }: { criticite: string | null }) {
  if (!criticite) return null;
  const c = CRITICITE[criticite];
  return <span title={c?.titre} className={`inline-block rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${c?.style ?? ""}`}>{criticite}</span>;
}

export function StatutRelecture({ statut }: { statut: string | null }) {
  if (statut !== "À relire") return null;
  return (
    <span className="inline-block rounded bg-yellow-100 px-1.5 py-0.5 text-[11px] font-semibold text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200" title="Contenu amorcé, pas encore validé">
      À relire
    </span>
  );
}
