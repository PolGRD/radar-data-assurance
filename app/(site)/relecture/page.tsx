import type { Metadata } from "next";
import Link from "next/link";
import { EnTetePage } from "@/components/EnTetePage";
import { Feuillet } from "@/components/Feuillet";
import { IconeExterne, IconeSuite } from "@/components/Icones";
import { NotConfigured } from "@/components/NotConfigured";
import { articlesEnAttente, articlesPublies, dateArticle } from "@/lib/articles";
import { getArticles } from "@/lib/notion";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Blog : relecture" };

export default async function RelecturePage() {
  const articles = await getArticles();
  const today = new Date().toISOString().slice(0, 10);
  const attente = articlesEnAttente(articles, today);
  const enLigne = articlesPublies(articles, today).length;

  return (
    <>
      <EnTetePage titre="Blog : relecture">
        Les articles au statut « Relecture », et les articles « Publié » dont la date n&apos;est pas encore arrivée, tels que le public les verra.
        Le blog public compte {enLigne} article{enLigne > 1 ? "s" : ""} en ligne.
      </EnTetePage>
      <NotConfigured />
      <Link href="/blog" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-prusse hover:underline dark:text-ink">
        Voir le blog public<IconeSuite className="h-3.5 w-3.5" />
      </Link>
      {attente.length ? (
        <ul className="divide-y divide-rule overflow-hidden rounded-xl border border-rule bg-sheet">
          {attente.map((a) => (
            <li key={a.id} className="flex items-start gap-4 px-4 py-4">
              <Feuillet date={dateArticle(a)} taille="sm" ton={a.statut === "Publié" ? "avenir" : "passe"} />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-semibold text-ink-3">{a.statut === "Publié" ? "Programmé, en ligne à cette date" : "En relecture"}</p>
                <Link href={`/relecture/${a.adresse}`} className="font-semibold leading-snug hover:underline">{a.titre}</Link>
              </div>
              <a href={a.notionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-sm text-ink-3 hover:text-ink">
                Notion<IconeExterne className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-rule-2 p-8 text-center text-sm text-ink-2">
          Rien en attente. Pour préparer un article, crée une page dans la base « Articles » de Notion et mets-la au statut « Relecture ».
        </p>
      )}
    </>
  );
}
