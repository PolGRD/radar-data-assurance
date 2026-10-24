"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CRITERES_FICHES, filtrerFiches } from "@/lib/filtres";
import { formatDate } from "@/lib/format";
import type { Fiche } from "@/lib/types";
import { Badge, PilierBadge } from "./Badge";
import { StatutFiche } from "./StatutFiche";

type Filtre = (typeof CRITERES_FICHES)[number];

function Select({ id, label, value, onChange, choix, tous = "Tous" }: {
  id: string; label: string; value: string; onChange: (v: string) => void; choix: string[]; tous?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-ink-2">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="champ">
        <option value="">{tous}</option>
        {choix.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}

const uniques = (valeurs: (string | null)[]) =>
  [...new Set(valeurs.filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b, "fr"));

export function FichesExplorer({ fiches }: { fiches: Fiche[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const get = (k: Filtre) => params.get(k) ?? "";

  function update(changes: Partial<Record<Filtre | "q", string>>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== query) update({ q: query });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const choix = useMemo(() => ({
    piliers: uniques(fiches.flatMap((f) => f.piliers)),
    tags: uniques(fiches.flatMap((f) => f.tags)),
    statuts: ["Ébauche", "En cours", "Stable"].filter((s) => fiches.some((f) => f.statut === s)),
  }), [fiches]);

  const resultats = useMemo(() => filtrerFiches(fiches, Object.fromEntries(params)), [fiches, params]);
  const actifs = CRITERES_FICHES.filter((k) => params.get(k)).length + (params.get("q") ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-xl border border-rule bg-sheet p-4 sm:grid-cols-[2fr_1fr_1fr_1fr] sm:items-end">
        <div className="flex flex-col gap-1">
          <label htmlFor="f-recherche" className="text-xs font-semibold text-ink-2">Rechercher</label>
          <input id="f-recherche" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Titre ou tag…" className="champ" />
        </div>
        <Select id="f-pilier" label="Pilier" value={get("pilier")} onChange={(v) => update({ pilier: v })} choix={choix.piliers} />
        <Select id="f-tag" label="Tag" value={get("tag")} onChange={(v) => update({ tag: v })} choix={choix.tags} />
        <Select id="f-statut" label="Statut" value={get("statut")} onChange={(v) => update({ statut: v })} choix={choix.statuts} />
      </div>
      <div className="flex items-center gap-4 text-sm text-ink-2">
        <p aria-live="polite">{resultats.length} fiche{resultats.length > 1 ? "s" : ""}</p>
        {actifs > 0 && (
          <button type="button" onClick={() => { setQuery(""); router.replace(pathname, { scroll: false }); }} className="font-medium text-vermillon underline">
            Effacer les filtres
          </button>
        )}
      </div>
      {resultats.length ? (
        <ul className="divide-y divide-rule overflow-hidden rounded-xl border border-rule bg-sheet">
          {resultats.map((f) => (
            <li key={f.id} className="group relative space-y-1.5 px-4 py-4 transition-colors hover:bg-sheet-2 focus-within:bg-sheet-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
                <StatutFiche statut={f.statut} />
                <span>mise à jour le {formatDate(f.miseAJour)}</span>
                {f.veilleIds.length > 0 && <span>{f.veilleIds.length} élément{f.veilleIds.length > 1 ? "s" : ""} de veille</span>}
              </div>
              <h2 className="font-semibold leading-snug text-pretty">
                <Link href={`/fiches/${f.adresse}`} className="after:absolute after:inset-0 group-hover:underline focus:outline-none">{f.titre}</Link>
              </h2>
              {(f.piliers.length > 0 || f.tags.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {f.piliers.map((p) => <PilierBadge key={p} pilier={p} />)}
                  {f.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-rule-2 p-8 text-center text-sm text-ink-2">
          {fiches.length ? "Aucune fiche ne correspond." : "Aucune fiche pour l'instant. Crée une page dans la base « Fiches de synthèse » de Notion, avec un titre."}
        </p>
      )}
    </div>
  );
}
