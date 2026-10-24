const NATURE: Record<string, { style: string; titre: string }> = {
  REG: { style: "border-vermillon/60 text-vermillon", titre: "Réglementaire : non négociable" },
  PDT: { style: "border-prusse/50 text-prusse dark:border-ink-3 dark:text-ink", titre: "Produit : dépend des conditions générales" },
  GES: { style: "border-rule-2 text-ink-2", titre: "Gestion : convention ou cohérence du SI" },
};
const CRITICITE: Record<string, { style: string; titre: string }> = {
  C1: { style: "bg-vermillon text-vermillon-ink", titre: "C1 bloquant" },
  C2: { style: "bg-vermillon-soft text-vermillon", titre: "C2 majeur" },
  C3: { style: "bg-sheet-2 text-ink-2 ring-1 ring-inset ring-rule", titre: "C3 mineur" },
};

export function NatureBadge({ nature }: { nature: string | null }) {
  if (!nature) return null;
  const n = NATURE[nature];
  return <span title={n?.titre} className={`inline-block rounded-[4px] border px-1.5 py-0.5 font-mono text-[11px] font-semibold ${n?.style ?? ""}`}>{nature}</span>;
}

export function CriticiteBadge({ criticite }: { criticite: string | null }) {
  if (!criticite) return null;
  const c = CRITICITE[criticite];
  return <span title={c?.titre} className={`inline-block rounded-[4px] px-1.5 py-0.5 font-mono text-[11px] font-semibold ${c?.style ?? ""}`}>{criticite}</span>;
}

export function StatutRelecture({ statut }: { statut: string | null }) {
  if (statut !== "À relire") return null;
  return (
    <span className="inline-block rounded-[4px] bg-alerte-soft px-1.5 py-0.5 text-[11px] font-semibold text-alerte" title="Contenu amorcé, pas encore validé">
      À relire
    </span>
  );
}
