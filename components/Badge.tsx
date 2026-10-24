import { pilierStyle } from "@/lib/format";
import { IconeEtoile } from "./Icones";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "outline" }) {
  const style = tone === "outline" ? "border border-rule-2 text-ink-2" : "bg-sheet-2 text-ink-2 ring-1 ring-inset ring-rule";
  return <span className={`inline-block rounded-[4px] px-1.5 py-0.5 text-xs font-medium ${style}`}>{children}</span>;
}

export function PilierBadge({ pilier }: { pilier: string }) {
  return <span className={`inline-block rounded-[4px] px-1.5 py-0.5 text-xs font-semibold ${pilierStyle(pilier)}`}>{pilier}</span>;
}

export function Pertinence({ value }: { value: number | null }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-[3px]" title={`Pertinence ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true" className={`h-[7px] w-[7px] rounded-full ${n <= value ? "bg-vermillon" : "bg-rule-2"}`} />
      ))}
      <span className="sr-only">Pertinence {value} sur 5</span>
    </span>
  );
}

export function Favori() {
  return (
    <span title="Favori" className="inline-flex text-vermillon">
      <IconeEtoile className="h-4 w-4" />
      <span className="sr-only">Favori</span>
    </span>
  );
}
