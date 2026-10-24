import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Favori, Pertinence, PilierBadge } from "@/components/Badge";
import { Feuillet } from "@/components/Feuillet";
import { IconeExterne, IconeRetour } from "@/components/Icones";
import { ImpactsParDomaine } from "@/components/ImpactCarte";
import { NoteBlocks } from "@/components/NoteBlocks";
import { impactsDeVeille } from "@/lib/calendrier";
import { formatDate } from "@/lib/format";
import { getFiches, getImpacts, getRegles, getVeilleDetail } from "@/lib/notion";

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
      <h2 className="border-b border-rule pb-1.5 text-sm font-semibold text-ink-2">{title}</h2>
      {children}
    </section>
  );
}

export default async function VeilleDetailPage({ params }: PageProps<"/veille/[id]">) {
  const [item, impacts, regles, fiches] = await Promise.all([getVeilleDetail((await params).id), getImpacts(), getRegles(), getFiches()]);
  if (!item) notFound();
  const impactsLies = impactsDeVeille(item, impacts ?? [], regles ?? []);
  const adresseFiche = new Map(fiches.map((f) => [f.id, f.adresse]));

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <Link href="/veille" className="inline-flex items-center gap-1 text-sm font-medium text-prusse hover:underline dark:text-ink"><IconeRetour className="h-4 w-4" />Fil de veille</Link>
        <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.02em] text-balance">
          {item.titre}
          {item.favori && <span className="ml-2 inline-flex align-middle"><Favori /></span>}
        </h1>
        <p className="text-sm text-ink-2">
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
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-prusse px-3.5 py-2 text-sm font-semibold text-prusse-ink transition-colors hover:bg-prusse-2">
              Lire la source<IconeExterne className="h-4 w-4" />
            </a>
          )}
          <a href={item.notionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-rule-2 bg-sheet px-3.5 py-2 text-sm font-medium transition-colors hover:border-ink-3">
            Modifier dans Notion<IconeExterne className="h-4 w-4" />
          </a>
        </div>
      </div>

      {item.resume && <Section title="Résumé"><p className="leading-relaxed">{item.resume}</p></Section>}
      {item.extrait && (
        <Section title="Extrait">
          <blockquote className="rounded-lg bg-sheet-2 px-4 py-3 leading-relaxed text-ink-2 ring-1 ring-inset ring-rule">{item.extrait}</blockquote>
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
          <ul className="list-disc space-y-1 pl-5 marker:text-ink-3">{item.fiches.map((f) => {
            const adresse = adresseFiche.get(f.id);
            return <li key={f.id}>{adresse ? <Link href={`/fiches/${adresse}`} className="hover:underline">{f.titre}</Link> : f.titre}</li>;
          })}</ul>
        </Section>
      )}
      {item.echeances.length > 0 && (
        <Section title="Échéances liées">
          <ul className="space-y-2">
            {item.echeances.map((e) => (
              <li key={e.id} className="flex items-center gap-3">
                {e.date ? <Feuillet date={e.date} taille="sm" /> : <span className="w-11 shrink-0" />}
                <span>{e.titre}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
