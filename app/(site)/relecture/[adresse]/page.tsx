import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CorpsArticle } from "@/components/blog/CorpsArticle";
import { IconeExterne, IconeRetour } from "@/components/Icones";
import { articlesEnAttente, dateArticle } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { getArticles, getContenuPage } from "@/lib/notion";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Relecture" };

export function generateStaticParams() {
  return [];
}

export default async function RelectureArticlePage({ params }: PageProps<"/relecture/[adresse]">) {
  const adresse = decodeURIComponent((await params).adresse);
  const article = articlesEnAttente(await getArticles(), new Date().toISOString().slice(0, 10)).find((a) => a.adresse === adresse);
  if (!article) notFound();
  const contenu = await getContenuPage(article.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/relecture" className="inline-flex items-center gap-1 text-sm font-medium text-prusse hover:underline dark:text-ink">
          <IconeRetour className="h-4 w-4" />Relecture
        </Link>
        <a href={article.notionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-rule-2 bg-sheet px-3 py-1.5 text-sm font-medium hover:border-ink-3">
          Modifier dans Notion<IconeExterne className="h-4 w-4" />
        </a>
      </div>
      <p role="status" className="rounded-lg border border-alerte/40 bg-alerte-soft p-3 text-sm font-medium text-alerte">
        {article.statut === "Publié"
          ? `Programmé : visible par le public à partir du ${formatDate(dateArticle(article))}.`
          : "Relecture : cet article n'est pas publié. Passe-le au statut « Publié » dans Notion pour le mettre en ligne."}
      </p>
      <article className="space-y-8">
        <CorpsArticle article={article} contenu={contenu} messageVide="Article vide : écris son contenu dans le corps de la page Notion." />
      </article>
    </div>
  );
}
