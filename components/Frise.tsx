"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { JalonFrise } from "@/lib/calendrier";
import { compteARebours, feuillet, formatDate, pilierStyle, reglementationStyle } from "@/lib/format";
import { Feuillet } from "./Feuillet";
import { IconeChevron, IconeExterne } from "./Icones";
import { ImpactsParDomaine } from "./ImpactCarte";

function Chip({ actif, onClick, children, className = "" }: { actif: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
        actif ? `border-transparent ${className} ring-2 ring-prusse ring-offset-1 ring-offset-paper dark:ring-ink` : "border-rule-2 bg-sheet text-ink-2 hover:border-ink-3 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

const STATUT_STYLE: Record<string, string> = {
  "À vérifier": "border-vermillon/50 text-vermillon",
  Reportée: "border-alerte/50 text-alerte",
};

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
    <li id={jalon.slug} className="relative scroll-mt-24 pl-10 md:pl-0">
      {/* Repère sur l'axe, à la couleur de la réglementation */}
      <span
        aria-hidden="true"
        className={`absolute top-7 left-4 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] ring-4 ring-paper md:left-1/2 ${style.point} ${
          ouvert ? "md:hidden" : ""
        } ${passe ? "opacity-50" : ""}`}
      />
      <article
        className={`rounded-xl border bg-sheet transition-colors ${
          ouvert ? "md:w-full" : cote === "gauche" ? "md:mr-auto md:w-[calc(50%-2rem)]" : "md:ml-auto md:w-[calc(50%-2rem)]"
        } ${ouvert ? "border-ink-3 shadow-[0_8px_24px_-12px_rgb(20_32_58/0.35)]" : "border-rule hover:border-rule-2"}`}
      >
        <button type="button" onClick={onToggle} aria-expanded={ouvert} aria-controls={idContenu} className="flex w-full gap-4 p-4 text-left">
          <Feuillet date={date} taille="md" ton={passe ? "passe" : "avenir"} />
          <span className="min-w-0 flex-1">
            <span className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className={`font-semibold ${passe ? "text-ink-3" : "text-vermillon"}`}>{compteARebours(today, date)}</span>
              {jalon.dateInitiale && jalon.dateInitiale !== date && (
                <span className="text-ink-3">au lieu du <s>{formatDate(jalon.dateInitiale)}</s></span>
              )}
              <span className="ml-auto flex items-center gap-1.5">
                {jalon.reglementation && <span className={`rounded-full px-2 py-0.5 font-semibold ${style.pastille}`}>{jalon.reglementation}</span>}
                {jalon.statut && jalon.statut !== "À venir" && (
                  <span className={`rounded-full border px-2 py-0.5 font-medium ${STATUT_STYLE[jalon.statut] ?? "border-rule-2 text-ink-2"}`}>{jalon.statut}</span>
                )}
              </span>
            </span>
            <span className={`block font-semibold leading-snug text-pretty ${passe ? "text-ink-2" : ""}`}>{jalon.intitule}</span>
            <span className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              {domaines.slice(0, 5).map((d) => (
                <span key={d} className="rounded-[4px] bg-sheet-2 px-1.5 py-0.5 text-ink-2 ring-1 ring-inset ring-rule">{d}</span>
              ))}
              {domaines.length > 5 && <span className="text-ink-3">+{domaines.length - 5}</span>}
              <span className="ml-auto inline-flex items-center gap-1 text-ink-3">
                {jalon.impacts.length ? `${jalon.impacts.length} impact${jalon.impacts.length > 1 ? "s" : ""}` : "Impacts à documenter"}
                {aRelire > 0 && <span className="font-semibold text-alerte">· {aRelire} à relire</span>}
                <IconeChevron className={`ml-1 h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${ouvert ? "rotate-90" : ""}`} />
              </span>
            </span>
          </span>
        </button>

        {ouvert && (
          <div id={idContenu} className="space-y-5 border-t border-rule p-4">
            {(jalon.impactAssurance || jalon.sourceOfficielle || jalon.piliers.length > 0) && (
              <div className="space-y-2 text-sm">
                {jalon.piliers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {jalon.piliers.map((p) => <span key={p} className={`rounded-[4px] px-1.5 py-0.5 text-xs font-semibold ${pilierStyle(p)}`}>{p}</span>)}
                  </div>
                )}
                {jalon.impactAssurance && <p className="max-w-[72ch] leading-relaxed text-ink-2">{jalon.impactAssurance}</p>}
                {jalon.sourceOfficielle && (
                  <a href={jalon.sourceOfficielle} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-prusse underline dark:text-ink">
                    Source officielle<IconeExterne className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
            <div>
              <h4 className="mb-2 font-semibold">Impacts chez l&apos;assureur</h4>
              <ImpactsParDomaine impacts={jalon.impacts} vide="Aucun impact renseigné pour cette échéance." />
            </div>
            {jalon.veille.length > 0 && (
              <div>
                <h4 className="mb-1.5 text-sm font-semibold text-ink-2">Dans la veille</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm marker:text-ink-3">
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
          <span className="inline-block rounded-[5px] bg-prusse px-3 py-0.5 font-chiffres text-2xl font-bold tracking-wide text-prusse-ink shadow-[0_2px_6px_-2px_rgb(20_32_58/0.4)]">{a}</span>
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
      <div className="mb-10 space-y-2.5">
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
            <button type="button" onClick={() => { setReglementations([]); setPiliers([]); }} className="ml-1 text-xs font-semibold text-vermillon underline">Tout afficher</button>
          )}
        </div>
      </div>

      {visibles.length ? (
        <ol className="relative flex flex-col gap-6">
          <span aria-hidden="true" className="absolute top-0 bottom-0 left-4 w-0.5 -translate-x-1/2 bg-rule-2 md:left-1/2" />
          {lignes}
        </ol>
      ) : (
        <p className="rounded-xl border border-dashed border-rule-2 p-8 text-center text-sm text-ink-2">Aucune échéance ne correspond.</p>
      )}
    </div>
  );
}

function Aujourdhui({ today }: { today: string }) {
  const f = feuillet(today);
  return (
    <li id="aujourdhui" className="relative scroll-mt-24 pl-10 md:pl-0 md:text-center">
      <span aria-hidden="true" className="absolute top-1/2 left-4 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-vermillon ring-4 ring-paper md:hidden" />
      <span className="feuillet-pose relative inline-flex items-baseline gap-2 rounded-[5px] bg-vermillon px-3.5 py-1.5 text-vermillon-ink">
        <span className="font-chiffres text-lg font-bold uppercase tracking-wide">Aujourd&apos;hui</span>
        <span className="text-sm font-medium">{f ? `${f.jourSemaine} ${f.quantieme} ${f.moisLong} ${f.annee}` : formatDate(today)}</span>
      </span>
    </li>
  );
}
