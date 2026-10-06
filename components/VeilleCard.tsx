import Link from "next/link";
import type { VeilleItem } from "@/lib/types";
import { formatDate, referenceDate } from "@/lib/format";
import { Badge, Pertinence, PilierBadge } from "./Badge";

export function VeilleCard({ item }: { item: VeilleItem }) {
  const texte = item.resume || item.extrait;
  return (
    <article className="relative flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-400 focus-within:ring-2 focus-within:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600">
      <div className="flex items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="truncate">
          {item.sources.join(", ") || "Source manuelle"} · {formatDate(referenceDate(item))}
        </span>
        <span className="flex items-center gap-2">
          {item.favori && <span title="Favori" aria-label="Favori" className="text-amber-500">★</span>}
          <Pertinence value={item.pertinence} />
        </span>
      </div>
      <h3 className="font-semibold leading-snug">
        <Link href={`/veille/${item.id}`} className="after:absolute after:inset-0 focus:outline-none">
          {item.titre}
        </Link>
      </h3>
      {texte && <p className="line-clamp-3 text-sm text-zinc-700 dark:text-zinc-300">{texte}</p>}
      <div className="mt-auto flex flex-wrap gap-1 pt-1">
        {item.piliers.map((p) => <PilierBadge key={p} pilier={p} />)}
        {item.type && <Badge tone="outline">{item.type}</Badge>}
        {item.tags.map((t) => <Badge key={t}>{t}</Badge>)}
        {item.impactIds.length > 0 && (
          <span className="rounded bg-orange-50 px-1.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-950 dark:text-orange-200">
            {item.impactIds.length} impact{item.impactIds.length > 1 ? "s" : ""} assureur
          </span>
        )}
      </div>
    </article>
  );
}
