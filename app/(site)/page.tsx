import Link from "next/link";
import { Badge, Favori, Pertinence, PilierBadge } from "@/components/Badge";
import { Feuillet } from "@/components/Feuillet";
import { IconeExterne, IconeSuite } from "@/components/Icones";
import { NotConfigured } from "@/components/NotConfigured";
import { PILIERS } from "@/lib/config";
import { compteARebours, daysAgo, ecart, formatDate, pilierBar, referenceDate } from "@/lib/format";
import { countATrier, getDernieresFiches, getEcheances, getImpacts, getParcours, getVeilleItems } from "@/lib/notion";
import type { VeilleItem } from "@/lib/types";

export const revalidate = 3600;

function Panel({ title, action, children, className = "" }: {
  title: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-xl border border-rule bg-sheet ${className}`}>
      <div className="flex items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

function LienSuite({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-prusse hover:underline dark:text-ink">
      {children}
      <IconeSuite className="h-3.5 w-3.5" />
    </Link>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-1 text-sm text-ink-3">{children}</p>;
}

function ItemLine({ item }: { item: VeilleItem }) {
  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <Link href={`/veille/${item.id}`} className="text-sm leading-snug hover:underline">{item.titre}</Link>
      <span className="flex shrink-0 items-center gap-2 pt-1">
        {item.favori && <Favori />}
        <Pertinence value={item.pertinence} />
      </span>
    </li>
  );
}

// Une ligne de la file « À traiter » : ce qui attend une action, chiffré.
function ATraiter({ nombre, label, detail, href, urgent }: {
  nombre: number | string; label: string; detail?: React.ReactNode; href?: string; urgent?: boolean;
}) {
  const corps = (
    <>
      <span className={`w-14 shrink-0 text-right font-chiffres text-[2rem] font-bold leading-none ${urgent ? "text-vermillon" : "text-ink"}`}>{nombre}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {detail && <span className="block truncate text-sm text-ink-3">{detail}</span>}
      </span>
      {href && <IconeSuite className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />}
    </>
  );
  const cls = "flex items-center gap-4 px-4 py-3";
  return (
    <li className="border-b border-rule last:border-b-0">
      {href ? <Link href={href} className={`group ${cls} transition-colors hover:bg-sheet-2`}>{corps}</Link> : <div className={cls}>{corps}</div>}
    </li>
  );
}

export default async function TableauDeBord() {
  const [items, aTrier, echeances, parcours, fiches, impacts] = await Promise.all([
    getVeilleItems(), countATrier(), getEcheances(), getParcours(), getDernieresFiches(), getImpacts(),
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
  const prochaine = prochaines[0];
  const aRelire = (impacts ?? []).filter((i) => i.statut === "À relire").length;
  const favoris = items.filter((i) => i.favori).length;

  const faits = parcours.filter((p) => p.statut === "Fait").length;
  const enCours = parcours.filter((p) => p.statut === "En cours").length;
  const piliersParcours = [...new Set(parcours.map((p) => p.pilier ?? "Transverse"))];

  return (
    <div className="space-y-8">
      <NotConfigured />

      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
        <div className="hidden md:block"><Feuillet date={today} taille="lg" /></div>
        <div className="min-w-0 space-y-4">
          <div className="flex items-start gap-4">
            <div className="md:hidden"><Feuillet date={today} taille="md" /></div>
            <div>
            <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-balance">Tableau de bord</h1>
            <p className="mt-1 text-ink-2">
              <Link href="/veille?periode=7" className="font-semibold text-ink underline decoration-rule-2 hover:decoration-ink">
                {semaine.length} retenu{semaine.length > 1 ? "s" : ""} cette semaine
              </Link>
              {", "}
              <Link href="/veille?favori=1" className="underline decoration-rule-2 hover:decoration-ink">{favoris} favori{favoris > 1 ? "s" : ""}</Link>
              {", "}
              <Link href="/veille" className="underline decoration-rule-2 hover:decoration-ink">{items.length} éléments au total</Link>.
            </p>
            </div>
          </div>
          <section aria-labelledby="a-traiter" className="overflow-hidden rounded-xl border border-rule bg-sheet">
            <h2 id="a-traiter" className="border-b border-rule bg-sheet-2 px-4 py-2 text-sm font-semibold text-ink-2">À traiter</h2>
            <ul>
              <ATraiter nombre={aTrier} label="articles à trier dans Notion" detail={aTrier ? "Statut « À trier », mis à la corbeille après 3 jours" : "Rien en attente"} urgent={aTrier > 0} />
              {impacts !== null && (
                <ATraiter nombre={aRelire} label={`impact${aRelire > 1 ? "s" : ""} assureur à relire`} detail={aRelire ? "Contenu amorcé, pas encore validé" : "Tout est validé"} href={aRelire ? "/calendrier" : undefined} urgent={aRelire > 0} />
              )}
              {prochaine?.date && (() => {
                const e = ecart(today, prochaine.date);
                return (
                  <ATraiter
                    nombre={e.nombre}
                    label={e.nombre ? `${e.unite} avant la prochaine échéance` : "La prochaine échéance tombe aujourd'hui"}
                    detail={prochaine.intitule}
                    href={`/calendrier#${prochaine.slug}`}
                    urgent={e.unite.startsWith("jour")}
                  />
                );
              })()}
            </ul>
          </section>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Panel title="Retenus de la semaine" action={<LienSuite href="/veille?periode=7">Tout voir</LienSuite>}>
          <div className="space-y-5">
            {parPilier.map(({ pilier, items: list }) => (
              <div key={pilier}>
                <h3 className="flex items-center justify-between border-b border-rule pb-1.5">
                  {pilier === "Sans pilier" ? <Badge>Sans pilier</Badge> : <PilierBadge pilier={pilier} />}
                  <span className="font-chiffres text-lg font-semibold text-ink-3">{list.length}</span>
                </h3>
                {list.length ? (
                  <ul className="divide-y divide-rule">{list.slice(0, 6).map((i) => <ItemLine key={i.id} item={i} />)}</ul>
                ) : <Empty>Rien cette semaine.</Empty>}
                {list.length > 6 && pilier !== "Sans pilier" && (
                  <LienSuite href={`/veille?periode=7&pilier=${encodeURIComponent(pilier)}`}>et {list.length - 6} de plus</LienSuite>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Prochaines échéances" action={<LienSuite href="/calendrier">La frise</LienSuite>}>
          {prochaines.length ? (
            <ul className="divide-y divide-rule">
              {prochaines.map((e) => (
                <li key={e.id} className="flex items-start gap-3 py-2.5">
                  <Feuillet date={e.date} taille="sm" />
                  <span className="min-w-0 flex-1">
                    <Link href={`/calendrier#${e.slug}`} className="text-sm font-medium leading-snug hover:underline">{e.intitule}</Link>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
                      {e.date && <span>{compteARebours(today, e.date)}</span>}
                      {e.reglementation && <Badge tone="outline">{e.reglementation}</Badge>}
                      {e.statut && e.statut !== "À venir" && <Badge>{e.statut}</Badge>}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : <Empty>Aucune échéance à venir.</Empty>}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Favoris et pertinence 5" className="lg:col-span-1">
          {aLaUne.length ? (
            <ul className="divide-y divide-rule">{aLaUne.map((i) => <ItemLine key={i.id} item={i} />)}</ul>
          ) : <Empty>Aucun favori ni élément de pertinence 5 pour l&apos;instant.</Empty>}
        </Panel>

        <Panel title="Progression du parcours">
          {parcours.length ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-2">
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
                      <span className="font-chiffres font-semibold text-ink-3">{done}/{list.length}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-sheet-2 ring-1 ring-inset ring-rule" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Parcours ${pilier}`}>
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
            <ul className="divide-y divide-rule">
              {fiches.map((f) => (
                <li key={f.id} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <a href={f.notionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 hover:underline">
                    {f.titre}<IconeExterne className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />
                  </a>
                  <span className="shrink-0 text-ink-3">{f.statut ? `${f.statut} · ` : ""}{formatDate(f.miseAJour)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Aucune fiche pour l&apos;instant.</Empty>}
        </Panel>
      </div>
    </div>
  );
}
