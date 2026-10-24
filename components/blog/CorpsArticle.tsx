import { Badge, PilierBadge } from "@/components/Badge";
import { Feuillet } from "@/components/Feuillet";
import { NoteBlocks } from "@/components/NoteBlocks";
import { dateArticle } from "@/lib/articles";
import type { ArticleBlog, NoteBlock } from "@/lib/types";

// Article tel que le lit le public ; la page de relecture privée l'affiche à l'identique.
export function CorpsArticle({ article, contenu, messageVide }: { article: ArticleBlog; contenu: NoteBlock[]; messageVide?: string }) {
  return (
    <>
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Feuillet date={dateArticle(article)} taille="md" ton="calme" />
          <div className="flex flex-wrap gap-1">{article.piliers.map((p) => <PilierBadge key={p} pilier={p} />)}</div>
        </div>
        <h1 className="text-[2.25rem] font-bold leading-[1.15] tracking-[-0.025em] text-balance">{article.titre}</h1>
        {article.resume && <p className="max-w-[65ch] text-lg leading-relaxed text-ink-2 text-pretty">{article.resume}</p>}
      </header>

      {article.couverture && (
        // Image externe (les fichiers Notion expirent) : pas d'optimisation Next pour ne dépendre d'aucun domaine.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.couverture} alt="" className="max-h-[26rem] w-full rounded-xl object-cover ring-1 ring-rule" />
      )}

      {contenu.length > 0 && <div className="text-[1.0625rem]"><NoteBlocks blocks={contenu} /></div>}
      {!contenu.length && messageVide && <p className="text-ink-2">{messageVide}</p>}

      {article.tags.length > 0 && (
        <footer className="flex flex-wrap items-center gap-1.5 border-t border-rule pt-5 text-sm text-ink-3">
          <span className="mr-1">Thèmes</span>
          {article.tags.map((t) => <Badge key={t}>{t}</Badge>)}
        </footer>
      )}
    </>
  );
}
