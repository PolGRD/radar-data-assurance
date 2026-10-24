import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, PilierBadge } from "@/components/Badge";
import { IconeExterne, IconeRetour } from "@/components/Icones";
import { NoteBlocks } from "@/components/NoteBlocks";
import { StatutFiche } from "@/components/StatutFiche";
import { formatDate } from "@/lib/format";
import { getFicheContenu, getFiches, getVeilleItems } from "@/lib/notion";

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

async function trouver(adresse: string) {
  const fiches = await getFiches();
  return fiches.find((f) => f.adresse === decodeURIComponent(adresse)) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/fiches/[adresse]">): Promise<Metadata> {
  const fiche = await trouver((await params).adresse);
  return { title: fiche?.titre ?? "Fiche introuvable" };
}

export default async function FichePage({ params }: PageProps<"/fiches/[adresse]">) {
  const fiche = await trouver((await params).adresse);
  if (!fiche) notFound();
  const [contenu, veille] = await Promise.all([getFicheContenu(fiche.id), getVeilleItems()]);
  // Seuls les éléments retenus ou lus ont une page sur le site.
  const veilleLiee = veille.filter((v) => fiche.veilleIds.includes(v.id));

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <Link href="/fiches" className="inline-flex items-center gap-1 text-sm font-medium text-prusse hover:underline dark:text-ink">
          <IconeRetour className="h-4 w-4" />Fiches de synthèse
        </Link>
        <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.02em] text-balance">{fiche.titre}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-2">
          <StatutFiche statut={fiche.statut} />
          <span>mise à jour le {formatDate(fiche.miseAJour)}</span>
        </div>
        {(fiche.piliers.length > 0 || fiche.tags.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {fiche.piliers.map((p) => <PilierBadge key={p} pilier={p} />)}
            {fiche.tags.map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
        )}
        <a href={fiche.notionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-rule-2 bg-sheet px-3.5 py-2 text-sm font-medium transition-colors hover:border-ink-3">
          Modifier dans Notion<IconeExterne className="h-4 w-4" />
        </a>
      </div>

      {contenu.length ? (
        <NoteBlocks blocks={contenu} />
      ) : (
        <p className="rounded-xl border border-dashed border-rule-2 p-6 text-sm text-ink-2">Fiche vide pour l&apos;instant : écris son contenu dans le corps de la page Notion.</p>
      )}

      {veilleLiee.length > 0 && (
        <section className="space-y-2">
          <h2 className="border-b border-rule pb-1.5 text-sm font-semibold text-ink-2">Sources de la veille</h2>
          <ul className="list-disc space-y-1 pl-5 marker:text-ink-3">
            {veilleLiee.map((v) => <li key={v.id}><Link href={`/veille/${v.id}`} className="hover:underline">{v.titre}</Link></li>)}
          </ul>
        </section>
      )}
    </article>
  );
}
