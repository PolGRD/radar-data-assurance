"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ImpactLie, JalonFrise } from "@/lib/calendrier";
import { formatDate, pilierStyle, reglementationStyle } from "@/lib/format";
import { CriticiteBadge, NatureBadge, StatutRelecture } from "./RegleBadges";

const EFFORT_STYLE: Record<string, string> = {
  Faible: "text-emerald-700 dark:text-emerald-400",
  Moyen: "text-amber-700 dark:text-amber-400",
  Fort: "text-red-700 dark:text-red-400",
};

function joursEntre(de: string, a: string): number {
  return Math.round((new Date(`${a}T12:00:00`).getTime() - new Date(`${de}T12:00:00`).getTime()) / 86_400_000);
}

function compteARebours(today: string, date: string): string {
  const j = joursEntre(today, date);
  if (j === 0) return "aujourd'hui";
  const abs = Math.abs(j);
  const duree = abs < 45 ? `${abs} jour${abs > 1 ? "s" : ""}` : abs < 730 ? `${Math.round(abs / 30.4)} mois` : `${Math.round(abs / 365)} ans`;
  return j > 0 ? `dans ${duree}` : `il y a ${duree}`;
}

function Chip({ actif, onClick, children, className = "" }: { actif: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        actif ? `border-transparent ${className} ring-2 ring-offset-1 ring-zinc-400 dark:ring-offset-zinc-950` : "border-zinc-300 text-zinc-600 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}

function Impact({ impact }: { impact: ImpactLie }) {
  const [ouvert, setOuvert] = useState(false);
  const idContenu = `impact-${impact.id}`;
  return (
    <li className="rounded-md border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/60">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-controls={idContenu}
        className="flex w-full flex-wrap items-start gap-x-2 gap-y-1 px-3 py-2 text-left"
      >
        <span aria-hidden="true" className={`mt-0.5 text-xs transition-transform ${ouvert ? "rotate-90" : ""}`}>▶</span>
        <span className="min-w-0 flex-1 text-sm font-medium leading-snug">{impact.intitule}</span>
        <span className="flex w-full flex-wrap items-center gap-1.5 pl-5 text-[11px] sm:w-auto sm:justify-end sm:pl-0">
          <StatutRelecture statut={impact.statut} />
          {impact.effort && <span className={`font-semibold ${EFFORT_STYLE[impact.effort] ?? ""}`}>Effort {impact.effort.toLowerCase()}</span>}
          {impact.regles.length > 0 && (
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 dark:bg-zinc-800">{impact.regles.length} règle{impact.regles.length > 1 ? "s" : ""}</span>
          )}
        </span>
      </button>
      {ouvert && (
        <div id={idContenu} className="space-y-3 border-t border-zinc-200 px-3 py-3 text-sm dark:border-zinc-800">
          {impact.description && <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{impact.description}</p>}
          <dl className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-[auto_1fr]">
            {impact.fonctions.length > 0 && (<><dt className="text-zinc-500">Fonctions</dt><dd>{impact.fonctions.join(", ")}</dd></>)}
            {impact.branches.length > 0 && (<><dt className="text-zinc-500">Branches</dt><dd>{impact.branches.join(", ")}</dd></>)}
            {impact.domaines.length > 1 && (<><dt className="text-zinc-500">Domaines data</dt><dd>{impact.domaines.join(", ")}</dd></>)}
          </dl>
          {impact.regles.length > 0 && (
            <div>
              <h5 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Règles de gestion concernées</h5>
              <ul className="space-y-1.5">
                {impact.regles.map((r) => (
                  <li key={r.id} className="rounded border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-start gap-2">
                      <span className="flex shrink-0 gap-1 pt-0.5"><NatureBadge nature={r.nature} /><CriticiteBadge criticite={r.criticite} /></span>
                      <Link href={`/regles#regle-${r.id}`} className="text-sm hover:underline">{r.regle}</Link>
                    </div>
                    {r.controle && <p className="mt-1 break-words font-mono text-xs text-zinc-600 dark:text-zinc-400">{r.controle}</p>}
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

function ImpactsParDomaine({ impacts }: { impacts: ImpactLie[] }) {
  // Un impact est rangé sous son premier domaine data, pour ne jamais apparaître deux fois.
  const groupes = useMemo(() => {
    const m = new Map<string, ImpactLie[]>();
    for (const i of impacts) {
      const d = i.domaines[0] ?? "Autres";
      m.set(d, [...(m.get(d) ?? []), i]);
    }
    return [...m.entries()];
  }, [impacts]);

  if (!impacts.length) {
    return <p className="text-sm text-zinc-500">Aucun impact data renseigné pour cette échéance.</p>;
  }
  return (
    <div className="space-y-4">
      {groupes.map(([domaine, liste]) => (
        <section key={domaine}>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">{domaine}</h4>
          <ul className="space-y-2">{liste.map((i) => <Impact key={i.id} impact={i} />)}</ul>
        </section>
      ))}
    </div>
  );
}

function Jalon({ jalon, today, ouvert, onToggle, cote }: {
  jalon: JalonFrise; today: string; ouvert: boolean; onToggle: () => void; cote: "gauche" | "droite";
}) {
  const style = reglementationStyle(jalon.reglementation);
  const date = jalon.date!;
  const passe = date < today;
  const domaines = [...new Set(jalon.impacts.flatMap((i) => i.domaines))];
  const aRelire = jalon.impacts.filter((i) => i.statut === "À relire").length;
  const idContenu = `contenu-${jalon.slug}`;

  return (
    <li
      id={jalon.slug}
      className="reveal relative scroll-mt-24 pl-10 md:pl-0"
    >
      {/* Point sur l'axe */}
      <span
        aria-hidden="true"
        className={`absolute top-5 left-4 h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-4 ring-white md:left-1/2 dark:ring-zinc-950 ${style.point} ${
          ouvert ? "md:hidden" : ""
        } ${passe ? "opacity-50" : ""}`}
      />
      <article
        className={`rounded-xl border bg-white shadow-sm transition dark:bg-zinc-900 ${
          ouvert ? "md:w-full" : cote === "gauche" ? "md:mr-auto md:w-[calc(50%-2rem)]" : "md:ml-auto md:w-[calc(50%-2rem)]"
        } ${
          ouvert ? "border-zinc-400 shadow-md dark:border-zinc-600" : "border-zinc-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800"
        } ${passe && !ouvert ? "opacity-70 hover:opacity-100" : ""}`}
      >
        <button type="button" onClick={onToggle} aria-expanded={ouvert} aria-controls={idContenu} className="block w-full p-4 text-left">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <time dateTime={date} className="font-semibold tabular-nums">{formatDate(date)}</time>
            {jalon.dateInitiale && jalon.dateInitiale !== date && (
              <span className="text-zinc-500">
                au lieu du <s>{formatDate(jalon.dateInitiale)}</s>
              </span>
            )}
            <span className="text-zinc-500">· {compteARebours(today, date)}</span>
            <span className="ml-auto flex items-center gap-1.5">
              {jalon.reglementation && <span className={`rounded-full px-2 py-0.5 font-medium ${style.pastille}`}>{jalon.reglementation}</span>}
              {jalon.statut && jalon.statut !== "À venir" && (
                <span className={`rounded-full border px-2 py-0.5 ${jalon.statut === "À vérifier" ? "border-red-300 text-red-700 dark:border-red-800 dark:text-red-300" : jalon.statut === "Reportée" ? "border-orange-300 text-orange-700 dark:border-orange-800 dark:text-orange-300" : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"}`}>
                  {jalon.statut}
                </span>
              )}
            </span>
          </div>
          <h3 className="font-semibold leading-snug">{jalon.intitule}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            {domaines.slice(0, 5).map((d) => (
              <span key={d} className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{d}</span>
            ))}
            {domaines.length > 5 && <span className="text-zinc-500">+{domaines.length - 5}</span>}
            <span className="ml-auto text-zinc-500">
              {jalon.impacts.length ? `${jalon.impacts.length} impact${jalon.impacts.length > 1 ? "s" : ""} data` : "Impacts à documenter"}
              {aRelire > 0 && ` · ${aRelire} à relire`}
              <span aria-hidden="true" className={`ml-2 inline-block transition-transform ${ouvert ? "rotate-180" : ""}`}>⌄</span>
            </span>
          </div>
        </button>

        {ouvert && (
          <div id={idContenu} className="space-y-5 border-t border-zinc-200 p-4 dark:border-zinc-800">
            {(jalon.impactAssurance || jalon.sourceOfficielle || jalon.piliers.length > 0) && (
              <div className="space-y-2 text-sm">
                {jalon.piliers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {jalon.piliers.map((p) => <span key={p} className={`rounded px-2 py-0.5 text-xs font-medium ${pilierStyle(p)}`}>{p}</span>)}
                  </div>
                )}
                {jalon.impactAssurance && <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{jalon.impactAssurance}</p>}
                {jalon.sourceOfficielle && (
                  <a href={jalon.sourceOfficielle} target="_blank" rel="noopener noreferrer" className="inline-block text-sm underline">Source officielle ↗</a>
                )}
              </div>
            )}
            <div>
              <h4 className="mb-2 font-semibold">Impacts data chez l&apos;assureur</h4>
              <ImpactsParDomaine impacts={jalon.impacts} />
            </div>
            {jalon.veille.length > 0 && (
              <div>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Dans la veille</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {jalon.veille.map((v) => <li key={v.id}><Link href={`/veille/${v.id}`} className="hover:underline">{v.titre}</Link></li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </article>
    </li>
  );
}

export function Frise({ jalons, today }: { jalons: JalonFrise[]; today: string }) {
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [reglementations, setReglementations] = useState<string[]>([]);
  const [piliers, setPiliers] = useState<string[]>([]);

  const toutesReglementations = useMemo(() => [...new Set(jalons.map((j) => j.reglementation).filter((r): r is string => Boolean(r)))], [jalons]);
  const tousPiliers = useMemo(() => [...new Set(jalons.flatMap((j) => j.piliers))].sort(), [jalons]);

  const visibles = jalons.filter(
    (j) =>
      (!reglementations.length || reglementations.includes(j.reglementation ?? "")) &&
      (!piliers.length || j.piliers.some((p) => piliers.includes(p))),
  );

  // À l'ouverture : on déplie la carte visée par l'adresse (#slug), sinon on se place sur « Aujourd'hui ».
  useEffect(() => {
    const cible = decodeURIComponent(window.location.hash.slice(1));
    const jalon = cible && jalons.find((j) => j.slug === cible);
    // Lecture de l'adresse au montage : l'état ne peut pas être initialisé côté serveur.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (jalon) setOuvert(jalon.slug);
    requestAnimationFrame(() => {
      const el = document.getElementById(jalon ? jalon.slug : "aujourdhui");
      el?.scrollIntoView({ block: jalon ? "start" : "center", behavior: "auto" });
    });
  }, [jalons]);

  function basculer(slug: string) {
    const suivant = ouvert === slug ? null : slug;
    setOuvert(suivant);
    history.replaceState(null, "", suivant ? `#${suivant}` : window.location.pathname);
  }

  function toggle(liste: string[], set: (v: string[]) => void, valeur: string) {
    set(liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur]);
  }

  const indexAujourdhui = visibles.findIndex((j) => j.date! >= today);
  const lignes: React.ReactNode[] = [];
  let annee = "";
  visibles.forEach((jalon, i) => {
    if (i === indexAujourdhui || (indexAujourdhui === -1 && i === visibles.length)) lignes.push(<Aujourdhui key="aujourdhui" today={today} />);
    const a = jalon.date!.slice(0, 4);
    if (a !== annee) {
      annee = a;
      lignes.push(
        <li key={`annee-${a}`} className="sticky top-2 z-10 pl-10 md:pl-0 md:text-center" aria-hidden="true">
          <span className="inline-block rounded-full bg-zinc-900 px-3 py-1 text-sm font-bold tabular-nums text-white shadow dark:bg-zinc-100 dark:text-zinc-900">{a}</span>
        </li>,
      );
    }
    lignes.push(
      <Jalon key={jalon.id} jalon={jalon} today={today} ouvert={ouvert === jalon.slug} onToggle={() => basculer(jalon.slug)} cote={i % 2 === 0 ? "gauche" : "droite"} />,
    );
  });
  if (indexAujourdhui === -1) lignes.push(<Aujourdhui key="aujourdhui" today={today} />);

  return (
    <div>
      <div className="mb-8 space-y-2">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par réglementation">
          {toutesReglementations.map((r) => (
            <Chip key={r} actif={reglementations.includes(r)} onClick={() => toggle(reglementations, setReglementations, r)} className={reglementationStyle(r).pastille}>
              <span aria-hidden="true" className={`mr-1.5 inline-block h-2 w-2 rounded-full ${reglementationStyle(r).point}`} />
              {r}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par pilier">
          {tousPiliers.map((p) => (
            <Chip key={p} actif={piliers.includes(p)} onClick={() => toggle(piliers, setPiliers, p)} className={pilierStyle(p)}>{p}</Chip>
          ))}
          {(reglementations.length > 0 || piliers.length > 0) && (
            <button type="button" onClick={() => { setReglementations([]); setPiliers([]); }} className="ml-1 text-xs underline">Tout afficher</button>
          )}
        </div>
      </div>

      {visibles.length ? (
        <ol className="relative flex flex-col gap-6">
          <span aria-hidden="true" className="absolute top-0 bottom-0 left-4 w-0.5 -translate-x-1/2 bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-200 md:left-1/2 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />
          {lignes}
        </ol>
      ) : (
        <p className="rounded border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">Aucune échéance ne correspond.</p>
      )}
    </div>
  );
}

function Aujourdhui({ today }: { today: string }) {
  return (
    <li id="aujourdhui" className="relative scroll-mt-24 pl-10 md:pl-0 md:text-center">
      {/* Sur mobile, le point est sur l'axe à gauche ; sur ordinateur, il est dans la pastille centrée sur l'axe. */}
      <span aria-hidden="true" className="absolute top-1/2 left-4 h-3 w-3 -translate-x-1/2 -translate-y-1/2 md:hidden">
        <span className="absolute inset-0 rounded-full bg-emerald-500 motion-safe:animate-ping" />
        <span className="absolute inset-0 rounded-full bg-emerald-500" />
      </span>
      <span className="relative inline-flex items-center gap-2 rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
        <span aria-hidden="true" className="relative hidden h-2 w-2 md:inline-block">
          <span className="absolute inset-0 rounded-full bg-emerald-500 motion-safe:animate-ping" />
          <span className="absolute inset-0 rounded-full bg-emerald-500" />
        </span>
        Aujourd&apos;hui · {formatDate(today)}
      </span>
    </li>
  );
}
