import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Pertinence, PilierBadge } from "@/components/Badge";
import { ImpactsParDomaine } from "@/components/ImpactCarte";
import { NoteBlocks } from "@/components/NoteBlocks";
import { impactsDeVeille } from "@/lib/calendrier";
import { formatDate } from "@/lib/format";
import { getImpacts, getRegles, getVeilleDetail } from "@/lib/notion";

export const revalidate = 3600;

// Pages générées à la première visite, puis mises en cache une heure.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/veille/[id]">): Promise<Metadata> {
  const item = await getVeilleDetail((await params).id);
  return { title: item?.titre ?? "Élément introuvable" };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</h2>
      {children}
    </section>
  );
}

export default async function VeilleDetailPage({ params }: PageProps<"/veille/[id]">) {
  const [item, impacts, regles] = await Promise.all([getVeilleDetail((await params).id), getImpacts(), getRegles()]);
  if (!item) notFound();
  const impactsLies = impactsDeVeille(item, impacts ?? [], regles ?? []);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <Link href="/veille" className="text-sm underline">← Fil de veille</Link>
        <h1 className="text-2xl font-bold leading-tight tracking-tight">
          {item.favori && <span className="mr-2 text-amber-500" title="Favori" aria-label="Favori">★</span>}
          {item.titre}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {item.sources.join(", ") || "Source manuelle"}
          {item.datePublication && ` · publié le ${formatDate(item.datePublication)}`}
          {` · collecté le ${formatDate(item.dateCollecte)}`}
          {item.statut && ` · ${item.statut}`}
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <Pertinence value={item.pertinence} />
          {item.piliers.map((p) => <PilierBadge key={p} pilier={p} />)}
          {item.type && <Badge tone="outline">{item.type}</Badge>}
          {item.branches.map((b) => <Badge key={b} tone="outline">{b}</Badge>)}
          {item.tags.map((t) => <Badge key={t}>{t}</Badge>)}
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
              Lire la source ↗
            </a>
          )}
          <a href={item.notionUrl} target="_blank" rel="noopener noreferrer" className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Modifier dans Notion ↗
          </a>
        </div>
      </div>

      {item.resume && <Section title="Résumé"><p className="leading-relaxed">{item.resume}</p></Section>}
      {item.extrait && (
        <Section title="Extrait">
          <blockquote className="border-l-4 border-zinc-300 pl-3 leading-relaxed text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">{item.extrait}</blockquote>
        </Section>
      )}
      {item.notes.length > 0 && <Section title="Mes notes"><NoteBlocks blocks={item.notes} /></Section>}
      {impactsLies.length > 0 && (
        <Section title="Impacts chez l'assureur">
          <ImpactsParDomaine impacts={impactsLies} vide="" />
        </Section>
      )}
      {item.fiches.length > 0 && (
        <Section title="Fiches liées">
          <ul className="list-disc space-y-1 pl-5">{item.fiches.map((f) => <li key={f.id}>{f.titre}</li>)}</ul>
        </Section>
      )}
      {item.echeances.length > 0 && (
        <Section title="Échéances liées">
          <ul className="list-disc space-y-1 pl-5">
            {item.echeances.map((e) => <li key={e.id}>{e.titre}{e.date && ` (${formatDate(e.date)})`}</li>)}
          </ul>
        </Section>
      )}
    </article>
  );
}
