import { pilierBar } from "@/lib/format";
import type { LigneParcours } from "@/lib/parcours";

export function BarreProgression({ ligne, titre = ligne.pilier }: {
  ligne: Pick<LigneParcours, "pilier" | "faits" | "total" | "pourcentage">; titre?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{titre}</span>
        <span className="font-chiffres font-semibold text-ink-3">{ligne.faits}/{ligne.total}</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-sheet-2 ring-1 ring-inset ring-rule"
        role="progressbar" aria-valuenow={ligne.pourcentage} aria-valuemin={0} aria-valuemax={100} aria-label={`Parcours ${ligne.pilier}`}
      >
        <div className={`h-full ${pilierBar(ligne.pilier)}`} style={{ width: `${ligne.pourcentage}%` }} />
      </div>
    </div>
  );
}
