"use client";

import Fuse from "fuse.js";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Regle } from "@/lib/types";
import { CriticiteBadge, NatureBadge } from "./RegleBadges";

export type RegleVue = Regle & { citations: { impact: string; echeances: { slug: string; intitule: string }[] }[] };

const FILTRES = ["domaine", "nature", "criticite", "statut", "citee"] as const;
type Filtre = (typeof FILTRES)[number];

const ORDRE_DOMAINES = [
  "Souscription et adhésion", "Cycle de vie et statuts", "Garanties", "Cotisations",
  "Encaissements et impayés", "Sinistres et prestations", "Bénéficiaires et référentiels",
];

function Select({ id, label, value, onChange, choix, tous = "Tous" }: {
  id: string; label: string; value: string; onChange: (v: string) => void; choix: string[]; tous?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900">
        <option value="">{tous}</option>
        {choix.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}

export function ReglesExplorer({ regles }: { regles: RegleVue[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [surlignee, setSurlignee] = useState<string | null>(null);
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

  // Arrivée depuis la frise (#regle-…) : on met la règle en évidence et on la fait défiler à l'écran.
  useEffect(() => {
    const cible = window.location.hash.slice(1);
    if (!cible.startsWith("regle-")) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSurlignee(cible);
    requestAnimationFrame(() => document.getElementById(cible)?.scrollIntoView({ block: "center" }));
  }, []);

  const choix = useMemo(() => {
    const uniques = (f: (r: RegleVue) => string | null) => [...new Set(regles.map(f).filter((v): v is string => Boolean(v)))];
    return {
      domaines: ORDRE_DOMAINES.filter((d) => regles.some((r) => r.domaine === d)).concat(uniques((r) => r.domaine).filter((d) => !ORDRE_DOMAINES.includes(d))),
      natures: ["REG", "PDT", "GES"].filter((n) => regles.some((r) => r.nature === n)),
      criticites: ["C1", "C2", "C3"].filter((c) => regles.some((r) => r.criticite === c)),
      statuts: uniques((r) => r.statut),
    };
  }, [regles]);

  const fuse = useMemo(() => new Fuse(regles, {
    keys: [{ name: "regle", weight: 3 }, { name: "controle", weight: 2 }, { name: "referenceJuridique", weight: 1 }],
    threshold: 0.35, ignoreLocation: true, ignoreDiacritics: true,
  }), [regles]);

  const resultats = useMemo(() => {
    const q = params.get("q")?.trim() ?? "";
    let liste = q ? fuse.search(q).map((r) => r.item) : regles;
    const f = Object.fromEntries(FILTRES.map((k) => [k, params.get(k) ?? ""])) as Record<Filtre, string>;
    if (f.domaine) liste = liste.filter((r) => r.domaine === f.domaine);
    if (f.nature) liste = liste.filter((r) => r.nature === f.nature);
    if (f.criticite) liste = liste.filter((r) => r.criticite === f.criticite);
    if (f.statut) liste = liste.filter((r) => r.statut === f.statut);
    if (f.citee) liste = liste.filter((r) => r.citations.length > 0);
    return liste;
  }, [regles, fuse, params]);

  // Sans recherche, on regroupe par domaine de gestion, dans l'ordre du cycle de vie du contrat.
  const groupes = useMemo(() => {
    if (params.get("q")) return [["", resultats] as const];
    return choix.domaines
      .map((d) => [d, resultats.filter((r) => r.domaine === d)] as const)
      .concat([["Sans domaine", resultats.filter((r) => !r.domaine)] as const])
      .filter(([, l]) => l.length);
  }, [resultats, choix.domaines, params]);

  const actifs = FILTRES.filter((k) => params.get(k)).length + (params.get("q") ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select id="r-domaine" label="Domaine de gestion" value={get("domaine")} onChange={(v) => update({ domaine: v })} choix={choix.domaines} />
        <Select id="r-nature" label="Nature" value={get("nature")} onChange={(v) => update({ nature: v })} choix={choix.natures} tous="Toutes" />
        <Select id="r-criticite" label="Criticité" value={get("criticite")} onChange={(v) => update({ criticite: v })} choix={choix.criticites} tous="Toutes" />
        <Select id="r-statut" label="Statut" value={get("statut")} onChange={(v) => update({ statut: v })} choix={choix.statuts} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="r-recherche" className="sr-only">Rechercher une règle</label>
        <input
          id="r-recherche" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher dans les règles, contrôles, références juridiques…"
          className="w-full flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(get("citee"))} onChange={(e) => update({ citee: e.target.checked ? "1" : "" })} />
          Citées par un impact
        </label>
        {actifs > 0 && (
          <button type="button" onClick={() => { setQuery(""); router.replace(pathname, { scroll: false }); }} className="text-sm underline">Effacer</button>
        )}
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">{resultats.length} règle{resultats.length > 1 ? "s" : ""}</p>

      {groupes.map(([domaine, liste]) => (
        <section key={domaine || "resultats"}>
          {domaine && <h2 className="sticky top-0 z-10 mb-2 bg-[var(--background)] py-1 font-semibold">{domaine} <span className="text-sm font-normal text-zinc-500">({liste.length})</span></h2>}
          <ul className="space-y-2">
            {liste.map((r) => (
              <li
                key={r.id}
                id={`regle-${r.id}`}
                className={`scroll-mt-24 rounded-lg border bg-white p-3 dark:bg-zinc-900 ${surlignee === `regle-${r.id}` ? "border-amber-400 ring-2 ring-amber-300 dark:border-amber-600 dark:ring-amber-700" : "border-zinc-200 dark:border-zinc-800"}`}
              >
                <div className="flex items-start gap-2">
                  <span className="flex shrink-0 gap-1 pt-0.5"><NatureBadge nature={r.nature} /><CriticiteBadge criticite={r.criticite} /></span>
                  <p className="flex-1 text-sm font-medium leading-snug">{r.regle}</p>
                  {r.statut && r.statut !== "Proposée" && <span className="shrink-0 text-xs text-zinc-500">{r.statut}</span>}
                </div>
                {r.controle && <p className="mt-1.5 break-words font-mono text-xs text-zinc-600 dark:text-zinc-400">{r.controle}</p>}
                {(r.referenceJuridique || r.citations.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                    {r.referenceJuridique && <span>{r.referenceJuridique}</span>}
                    {r.citations.map((c) => (
                      <span key={c.impact}>
                        Impact : {c.impact}
                        {c.echeances.map((e) => (
                          <Link key={e.slug} href={`/calendrier#${e.slug}`} className="ml-1 underline">→ {e.intitule}</Link>
                        ))}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
