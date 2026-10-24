import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CorpsArticle } from "@/components/blog/CorpsArticle";
import { IconeRetour } from "@/components/Icones";
import { articlesPublies, dateArticle } from "@/lib/articles";
import { getArticles, getContenuPage } from "@/lib/notion";

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

async function trouver(adresse: string) {
  const publies = articlesPublies(await getArticles(), new Date().toISOString().slice(0, 10));
  const i = publies.findIndex((a) => a.adresse === decodeURIComponent(adresse));
  return i === -1 ? null : { article: publies[i], plusRecent: publies[i - 1] ?? null, plusAncien: publies[i + 1] ?? null };
}

export async function generateMetadata({ params }: PageProps<"/blog/[adresse]">): Promise<Metadata> {
  const trouve = await trouver((await params).adresse);
  if (!trouve) return { title: "Article introuvable" };
  const { article } = trouve;
  return {
    title: article.titre,
    description: article.resume || undefined,
    alternates: { canonical: `/blog/${article.adresse}` },
    openGraph: {
      type: "article", title: article.titre, description: article.resume || undefined, url: `/blog/${article.adresse}`,
      publishedTime: dateArticle(article), images: article.couverture ? [article.couverture] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/blog/[adresse]">) {
  const trouve = await trouver((await params).adresse);
  if (!trouve) notFound();
  const { article, plusRecent, plusAncien } = trouve;
  const contenu = await getContenuPage(article.id);

  return (
    <article className="space-y-8">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-prusse hover:underline dark:text-ink">
        <IconeRetour className="h-4 w-4" />Tous les articles
      </Link>
      <CorpsArticle article={article} contenu={contenu} />
      {(plusRecent || plusAncien) && (
        <nav aria-label="Autres articles" className="grid gap-3 border-t border-rule pt-6 sm:grid-cols-2">
          {plusAncien && (
            <Link href={`/blog/${plusAncien.adresse}`} className="rounded-xl border border-rule bg-sheet p-4 transition-colors hover:border-rule-2">
              <span className="block text-xs font-semibold text-ink-3">Article précédent</span>
              <span className="mt-1 block font-medium leading-snug">{plusAncien.titre}</span>
            </Link>
          )}
          {plusRecent && (
            <Link href={`/blog/${plusRecent.adresse}`} className="rounded-xl border border-rule bg-sheet p-4 text-right transition-colors hover:border-rule-2 sm:col-start-2">
              <span className="block text-xs font-semibold text-ink-3">Article suivant</span>
              <span className="mt-1 block font-medium leading-snug">{plusRecent.titre}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
