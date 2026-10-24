import Link from "next/link";
import type { VeilleItem } from "@/lib/types";
import { referenceDate } from "@/lib/format";
import { Badge, Favori, Pertinence, PilierBadge } from "./Badge";
import { Feuillet } from "./Feuillet";

export function VeilleCard({ item }: { item: VeilleItem }) {
  const texte = item.resume || item.extrait;
  return (
    <article className="group relative flex gap-4 px-4 py-4 transition-colors hover:bg-sheet-2 focus-within:bg-sheet-2">
      <Feuillet date={referenceDate(item)} taille="sm" ton="calme" className="mt-0.5" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-3 text-xs text-ink-3">
          <span className="truncate font-medium">{item.sources.join(", ") || "Source manuelle"}</span>
          <span className="flex shrink-0 items-center gap-2">
            {item.favori && <Favori />}
            <Pertinence value={item.pertinence} />
          </span>
        </div>
        <h3 className="font-semibold leading-snug text-pretty">
          <Link href={`/veille/${item.id}`} className="after:absolute after:inset-0 group-hover:underline focus:outline-none">
            {item.titre}
          </Link>
        </h3>
        {texte && <p className="line-clamp-2 max-w-[70ch] text-sm leading-relaxed text-ink-2">{texte}</p>}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {item.piliers.map((p) => <PilierBadge key={p} pilier={p} />)}
          {item.type && <Badge tone="outline">{item.type}</Badge>}
          {item.tags.map((t) => <Badge key={t}>{t}</Badge>)}
          {item.impactIds.length > 0 && (
            <span className="rounded-[4px] bg-vermillon-soft px-1.5 py-0.5 text-xs font-semibold text-vermillon">
              {item.impactIds.length} impact{item.impactIds.length > 1 ? "s" : ""} assureur
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
