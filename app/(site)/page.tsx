import Link from "next/link";
import { Badge, Pertinence, PilierBadge } from "@/components/Badge";
import { NotConfigured } from "@/components/NotConfigured";
import { PILIERS } from "@/lib/config";
import { daysAgo, formatDate, pilierBar, referenceDate } from "@/lib/format";
import { countATrier, getDernieresFiches, getEcheances, getParcours, getVeilleItems } from "@/lib/notion";
import type { VeilleItem } from "@/lib/types";

export const revalidate = 3600;

function Panel({ title, action, children, className = "" }: {
  title: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500 dark:text-zinc-400">{children}</p>;
}

function ItemLine({ item }: { item: VeilleItem }) {
  return (
    <li className="flex items-start justify-between gap-3 py-1.5">
      <Link href={`/veille/${item.id}`} className="text-sm hover:underline">{item.titre}</Link>
      <Pertinence value={item.pertinence} />
    </li>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = (
    <>
      <span className="block text-3xl font-bold tabular-nums">{value}</span>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
    </>
  );
  const cls = "block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
  return href ? <Link href={href} className={`${cls} hover:border-zinc-400 dark:hover:border-zinc-600`}>{body}</Link> : <div className={cls}>{body}</div>;
}

export default async function TableauDeBord() {
  const [items, aTrier, echeances, parcours, fiches] = await Promise.all([
    getVeilleItems(), countATrier(), getEcheances(), getParcours(), getDernieresFiches(),
  ]);

  const weekStart = daysAgo(7).getTime();
  const semaine = items.filter((i) => new Date(i.dateCollecte).getTime() >= weekStart);
  const parPilier = [...PILIERS, "Sans pilier"].map((pilier) => ({
    pilier,
    items: semaine.filter((i) => (pilier === "Sans pilier" ? i.piliers.length === 0 : i.piliers.includes(pilier))),
  })).filter((g) => g.pilier !== "Sans pilier" || g.items.length > 0);

  const aLaUne = items
    .filter((i) => i.favori || i.pertinence === 5)
    .sort((a, b) => referenceDate(b).localeCompare(referenceDate(a)))
    .slice(0, 8);

  const today = new Date().toISOString().slice(0, 10);
  const prochaines = echeances.filter((e) => e.date && e.date >= today).slice(0, 5);

  const faits = parcours.filter((p) => p.statut === "Fait").length;
  const enCours = parcours.filter((p) => p.statut === "En cours").length;
  const piliersParcours = [...new Set(parcours.map((p) => p.pilier ?? "Transverse"))];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
      <NotConfigured />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="retenus cette semaine" value={semaine.length} href="/veille?periode=7" />
        <Stat label="en attente de tri dans Notion" value={aTrier} />
        <Stat label="favoris" value={items.filter((i) => i.favori).length} href="/veille?favori=1" />
        <Stat label="éléments au total" value={items.length} href="/veille" />
      </div>

      <Panel title="Retenus de la semaine, par pilier" action={<Link href="/veille?periode=7" className="text-sm underline">Tout voir</Link>}>
        <div className="grid gap-4 md:grid-cols-3">
          {parPilier.map(({ pilier, items: list }) => (
            <div key={pilier}>
              <h3 className="mb-1 flex items-center justify-between">
                {pilier === "Sans pilier" ? <Badge>Sans pilier</Badge> : <PilierBadge pilier={pilier} />}
                <span className="text-sm tabular-nums text-zinc-500">{list.length}</span>
              </h3>
              {list.length ? (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">{list.slice(0, 6).map((i) => <ItemLine key={i.id} item={i} />)}</ul>
              ) : <Empty>Rien cette semaine.</Empty>}
              {list.length > 6 && pilier !== "Sans pilier" && (
                <Link href={`/veille?periode=7&pilier=${encodeURIComponent(pilier)}`} className="text-sm underline">
                  et {list.length - 6} de plus
                </Link>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Favoris et pertinence 5">
          {aLaUne.length ? (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">{aLaUne.map((i) => <ItemLine key={i.id} item={i} />)}</ul>
          ) : <Empty>Aucun favori ni élément de pertinence 5 pour l&apos;instant.</Empty>}
        </Panel>

        <Panel title="Prochaines échéances" action={<Link href="/calendrier" className="text-sm underline">Voir la frise</Link>}>
          {prochaines.length ? (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {prochaines.map((e) => (
                <li key={e.id} className="flex items-start gap-3 py-1.5 text-sm">
                  <span className="w-24 shrink-0 tabular-nums text-zinc-600 dark:text-zinc-400">{formatDate(e.date)}</span>
                  <span className="flex-1">
                    <Link href={`/calendrier#${e.slug}`} className="hover:underline">{e.intitule}</Link>
                    <span className="mt-0.5 flex flex-wrap gap-1">
                      {e.reglementation && <Badge tone="outline">{e.reglementation}</Badge>}
                      {e.statut && e.statut !== "À venir" && <Badge>{e.statut}</Badge>}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : <Empty>Aucune échéance à venir.</Empty>}
        </Panel>

        <Panel title="Progression du parcours">
          {parcours.length ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {faits} fait{faits > 1 ? "s" : ""}, {enCours} en cours, sur {parcours.length} compétences.
              </p>
              {piliersParcours.map((pilier) => {
                const list = parcours.filter((p) => (p.pilier ?? "Transverse") === pilier);
                const done = list.filter((p) => p.statut === "Fait").length;
                const pct = Math.round((done / list.length) * 100);
                return (
                  <div key={pilier}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{pilier}</span>
                      <span className="tabular-nums text-zinc-500">{done}/{list.length}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Parcours ${pilier}`}>
                      <div className={`h-full ${pilierBar(pilier)}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <Empty>Parcours vide.</Empty>}
        </Panel>

        <Panel title="Dernières fiches modifiées">
          {fiches.length ? (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {fiches.map((f) => (
                <li key={f.id} className="flex items-start justify-between gap-3 py-1.5 text-sm">
                  <a href={f.notionUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{f.titre}</a>
                  <span className="shrink-0 text-zinc-500">{f.statut ? `${f.statut} · ` : ""}{formatDate(f.miseAJour)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Aucune fiche pour l&apos;instant.</Empty>}
        </Panel>
      </div>
    </div>
  );
}
