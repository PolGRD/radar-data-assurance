"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ImpactLie } from "@/lib/calendrier";
import { IconeChevron } from "./Icones";
import { CriticiteBadge, NatureBadge, StatutRelecture } from "./RegleBadges";

const EFFORT_STYLE: Record<string, string> = {
  Faible: "text-ink-2",
  Moyen: "text-alerte",
  Fort: "text-vermillon",
};

const TYPE_STYLE: Record<string, string> = {
  Data: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  IT: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  Métier: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
};

export function TypeImpact({ type }: { type: string }) {
  return <span className={`rounded-[4px] px-1.5 py-0.5 font-semibold ${TYPE_STYLE[type] ?? "bg-sheet-2 text-ink-2"}`}>{type}</span>;
}

export function Impact({ impact }: { impact: ImpactLie }) {
  const [ouvert, setOuvert] = useState(false);
  const idContenu = `impact-${impact.id}`;
  return (
    <li className={`rounded-lg border bg-sheet-2 transition-colors ${ouvert ? "border-rule-2" : "border-rule hover:border-rule-2"}`}>
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-controls={idContenu}
        className="flex w-full flex-wrap items-start gap-x-2 gap-y-1 px-3 py-2.5 text-left"
      >
        <IconeChevron className={`mt-0.5 h-4 w-4 shrink-0 text-ink-3 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${ouvert ? "rotate-90" : ""}`} />
        <span className="min-w-0 flex-1 text-sm font-medium leading-snug">{impact.intitule}</span>
        <span className="flex w-full flex-wrap items-center gap-1.5 pl-6 text-[11px] sm:w-auto sm:justify-end sm:pl-0">
          {impact.types.map((t) => <TypeImpact key={t} type={t} />)}
          <StatutRelecture statut={impact.statut} />
          {impact.effort && <span className={`font-semibold ${EFFORT_STYLE[impact.effort] ?? ""}`}>Effort {impact.effort.toLowerCase()}</span>}
          {impact.regles.length > 0 && (
            <span className="rounded-[4px] bg-sheet px-1.5 py-0.5 font-medium text-ink-2 ring-1 ring-inset ring-rule">{impact.regles.length} règle{impact.regles.length > 1 ? "s" : ""}</span>
          )}
        </span>
      </button>
      {ouvert && (
        <div id={idContenu} className="space-y-3 border-t border-rule px-3 py-3 text-sm">
          {impact.description && <p className="max-w-[72ch] leading-relaxed text-ink-2">{impact.description}</p>}
          <dl className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-[auto_1fr]">
            {impact.fonctions.length > 0 && (<><dt className="text-ink-3">Fonctions</dt><dd>{impact.fonctions.join(", ")}</dd></>)}
            {impact.branches.length > 0 && (<><dt className="text-ink-3">Branches</dt><dd>{impact.branches.join(", ")}</dd></>)}
            {impact.domaines.length > 1 && (<><dt className="text-ink-3">Domaines data</dt><dd>{impact.domaines.join(", ")}</dd></>)}
          </dl>
          {impact.regles.length > 0 && (
            <div>
              <h5 className="mb-1.5 text-xs font-semibold text-ink-2">Règles de gestion concernées</h5>
              <ul className="space-y-1.5">
                {impact.regles.map((r) => (
                  <li key={r.id} className="rounded-md border border-rule bg-sheet p-2.5">
                    <div className="flex items-start gap-2">
                      <span className="flex shrink-0 gap-1 pt-0.5"><NatureBadge nature={r.nature} /><CriticiteBadge criticite={r.criticite} /></span>
                      <Link href={`/regles#regle-${r.id}`} className="text-sm hover:underline">{r.regle}</Link>
                    </div>
                    {r.controle && <p className="mt-1 break-words font-mono text-xs text-ink-2">{r.controle}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// Les impacts IT ou métier n'ont pas toujours de domaine data : on les range alors selon leur type.
const GROUPE_PAR_TYPE: Record<string, string> = { IT: "Systèmes et paramétrage", Métier: "Organisation et métier" };

export function ImpactsParDomaine({ impacts, vide }: { impacts: ImpactLie[]; vide: string }) {
  // Un impact est rangé sous son premier domaine data, pour ne jamais apparaître deux fois.
  const groupes = useMemo(() => {
    const m = new Map<string, ImpactLie[]>();
    for (const i of impacts) {
      const d = i.domaines[0] ?? GROUPE_PAR_TYPE[i.types[0]] ?? "Autres";
      m.set(d, [...(m.get(d) ?? []), i]);
    }
    return [...m.entries()];
  }, [impacts]);

  if (!impacts.length) {
    return <p className="text-sm text-ink-3">{vide}</p>;
  }
  return (
    <div className="space-y-4">
      {groupes.map(([domaine, liste]) => (
        <section key={domaine}>
          <h4 className="mb-1.5 text-xs font-semibold text-ink-3">{domaine}</h4>
          <ul className="space-y-2">{liste.map((i) => <Impact key={i.id} impact={i} />)}</ul>
        </section>
      ))}
    </div>
  );
}
