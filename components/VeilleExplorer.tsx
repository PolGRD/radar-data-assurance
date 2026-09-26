"use client";

import Fuse from "fuse.js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { VeilleItem } from "@/lib/types";
import { daysAgo, referenceDate } from "@/lib/format";
import { VeilleCard } from "./VeilleCard";

const PERIODES = [
  { value: "7", label: "7 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "3 derniers mois" },
  { value: "365", label: "12 derniers mois" },
];

const FILTER_KEYS = ["pilier", "tag", "branche", "source", "type", "periode", "pertinence", "favori", "tri"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

function options(items: VeilleItem[], pick: (i: VeilleItem) => (string | null)[]): string[] {
  const set = new Set<string>();
  for (const i of items) for (const v of pick(i)) if (v) set.add(v);
  return [...set].sort((a, b) => a.localeCompare(b, "fr"));
}

function Select({ id, label, value, onChange, choices, allLabel = "Tous" }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  choices: { value: string; label: string }[]; allLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">{allLabel}</option>
        {choices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    </div>
  );
}

const asChoices = (values: string[]) => values.map((v) => ({ value: v, label: v }));

export function VeilleExplorer({ items }: { items: VeilleItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const get = (k: FilterKey) => params.get(k) ?? "";

  function update(changes: Partial<Record<FilterKey | "q", string>>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // La recherche met l'URL à jour après une courte pause de frappe.
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== query) update({ q: query });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const choices = useMemo(() => ({
    piliers: options(items, (i) => i.piliers),
    tags: options(items, (i) => i.tags),
    branches: options(items, (i) => i.branches),
    sources: options(items, (i) => i.sources),
    types: options(items, (i) => [i.type]),
  }), [items]);

  const fuse = useMemo(() => new Fuse(items, {
    keys: [
      { name: "titre", weight: 3 },
      { name: "resume", weight: 2 },
      { name: "extrait", weight: 1 },
      { name: "tags", weight: 1 },
      { name: "sources", weight: 1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    ignoreDiacritics: true,
  }), [items]);

  const results = useMemo(() => {
    const q = params.get("q")?.trim() ?? "";
    let list = q ? fuse.search(q).map((r) => r.item) : items;
    const f = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? ""])) as Record<FilterKey, string>;
    if (f.pilier) list = list.filter((i) => i.piliers.includes(f.pilier));
    if (f.tag) list = list.filter((i) => i.tags.includes(f.tag));
    if (f.branche) list = list.filter((i) => i.branches.includes(f.branche));
    if (f.source) list = list.filter((i) => i.sources.includes(f.source));
    if (f.type) list = list.filter((i) => i.type === f.type);
    if (f.pertinence) list = list.filter((i) => (i.pertinence ?? 0) >= Number(f.pertinence));
    if (f.favori) list = list.filter((i) => i.favori);
    if (f.periode) {
      const since = daysAgo(Number(f.periode)).getTime();
      list = list.filter((i) => new Date(referenceDate(i)).getTime() >= since);
    }
    if (f.tri === "pertinence") {
      list = [...list].sort((a, b) => (b.pertinence ?? 0) - (a.pertinence ?? 0) || referenceDate(b).localeCompare(referenceDate(a)));
    } else if (!q) {
      list = [...list].sort((a, b) => referenceDate(b).localeCompare(referenceDate(a)));
    }
    return list;
  }, [items, fuse, params]);

  const activeFilters = FILTER_KEYS.filter((k) => k !== "tri" && params.get(k)).length + (params.get("q") ? 1 : 0);

  const filters = (
    <div className="flex flex-col gap-3">
      <Select id="f-pilier" label="Pilier" value={get("pilier")} onChange={(v) => update({ pilier: v })} choices={asChoices(choices.piliers)} />
      <Select id="f-tag" label="Tag" value={get("tag")} onChange={(v) => update({ tag: v })} choices={asChoices(choices.tags)} />
      <Select id="f-branche" label="Branche" value={get("branche")} onChange={(v) => update({ branche: v })} choices={asChoices(choices.branches)} allLabel="Toutes" />
      <Select id="f-source" label="Source" value={get("source")} onChange={(v) => update({ source: v })} choices={asChoices(choices.sources)} allLabel="Toutes" />
      <Select id="f-type" label="Type" value={get("type")} onChange={(v) => update({ type: v })} choices={asChoices(choices.types)} />
      <Select id="f-periode" label="Période" value={get("periode")} onChange={(v) => update({ periode: v })} choices={PERIODES} allLabel="Toute la période" />
      <Select
        id="f-pertinence" label="Pertinence minimale" value={get("pertinence")} onChange={(v) => update({ pertinence: v })}
        choices={[5, 4, 3, 2].map((n) => ({ value: String(n), label: n === 5 ? "5 uniquement" : `${n} et plus` }))} allLabel="Toutes"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={Boolean(get("favori"))} onChange={(e) => update({ favori: e.target.checked ? "1" : "" })} />
        Favoris uniquement
      </label>
      {activeFilters > 0 && (
        <button
          type="button"
          onClick={() => { setQuery(""); router.replace(pathname, { scroll: false }); }}
          className="self-start text-sm underline"
        >
          Effacer les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <aside className="md:w-60 md:shrink-0" aria-label="Filtres">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="filtres"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm font-medium md:hidden dark:border-zinc-800"
        >
          {filtersOpen ? "Masquer les filtres" : "Filtres"}{activeFilters ? ` (${activeFilters})` : ""}
        </button>
        <div id="filtres" className={`${filtersOpen ? "mt-3" : "hidden"} md:mt-0 md:block`}>{filters}</div>
      </aside>

      <div className="flex-1">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="recherche" className="sr-only">Rechercher</label>
          <input
            id="recherche"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans les titres, résumés, extraits…"
            className="w-full flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <label className="flex items-center gap-2 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Trier par</span>
            <select
              value={get("tri")}
              onChange={(e) => update({ tri: e.target.value })}
              className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">{params.get("q") ? "Pertinence de la recherche" : "Date"}</option>
              <option value="pertinence">Note de pertinence</option>
            </select>
          </label>
        </div>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
          {results.length} élément{results.length > 1 ? "s" : ""}
        </p>
        {results.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((item) => <VeilleCard key={item.id} item={item} />)}
          </div>
        ) : (
          <p className="rounded border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            Aucun élément ne correspond.
          </p>
        )}
      </div>
    </div>
  );
}
