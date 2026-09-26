import { pilierStyle } from "@/lib/format";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "outline" }) {
  const style =
    tone === "outline"
      ? "border border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
      : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${style}`}>{children}</span>;
}

export function PilierBadge({ pilier }: { pilier: string }) {
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${pilierStyle(pilier)}`}>{pilier}</span>;
}

export function Pertinence({ value }: { value: number | null }) {
  if (!value) return null;
  return (
    <span className="whitespace-nowrap text-sm tracking-tight text-amber-600 dark:text-amber-400" title={`Pertinence ${value} sur 5`}>
      <span aria-hidden="true">{"●".repeat(value)}<span className="text-zinc-300 dark:text-zinc-600">{"●".repeat(5 - value)}</span></span>
      <span className="sr-only">Pertinence {value} sur 5</span>
    </span>
  );
}
