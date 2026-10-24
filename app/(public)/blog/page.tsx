import type { Metadata } from "next";
import Link from "next/link";
import { PilierBadge } from "@/components/Badge";
import { Feuillet } from "@/components/Feuillet";
import { articlesPublies, dateArticle, parMois } from "@/lib/articles";
import { getArticles } from "@/lib/notion";

export const revalidate = 3600;

const DESCRIPTION = "Data gouvernance, IA et assurance de personnes : ce que je retiens de ma veille, et ce que cela change pour les données d'un assureur.";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", title: "Radar Data Assurance", description: DESCRIPTION, url: "/blog" },
};

export default async function BlogPage() {
  const today = new Date().toISOString().slice(0, 10);
  const mois = parMois(articlesPublies(await getArticles(), today));

  return (
    <>
      <div className="mb-10">
        <h1 className="text-[2.25rem] font-bold leading-tight tracking-[-0.025em]">Blog</h1>
        <p className="mt-2 max-w-[60ch] text-lg leading-relaxed text-ink-2">{DESCRIPTION}</p>
      </div>

      {mois.length ? (
        <div className="space-y-12">
          {mois.map(({ cle, libelle, articles }) => (
            <section key={cle} aria-labelledby={`mois-${cle}`}>
              <h2 id={`mois-${cle}`} className="mb-2 flex items-center gap-3 font-chiffres text-xl font-bold uppercase tracking-wide text-prusse dark:text-ink">
                {libelle}
                <span aria-hidden="true" className="h-px flex-1 bg-rule-2" />
              </h2>
              <ul className="divide-y divide-rule">
                {articles.map((a) => (
                  <li key={a.id} className="group relative flex gap-5 py-5">
                    <Feuillet date={dateArticle(a)} taille="md" ton="calme" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h3 className="text-xl font-semibold leading-snug tracking-[-0.01em] text-pretty">
                        <Link href={`/blog/${a.adresse}`} className="after:absolute after:inset-0 group-hover:underline focus:outline-none">{a.titre}</Link>
                      </h3>
                      {a.resume && <p className="line-clamp-3 leading-relaxed text-ink-2">{a.resume}</p>}
                      {a.piliers.length > 0 && <div className="flex flex-wrap gap-1 pt-1">{a.piliers.map((p) => <PilierBadge key={p} pilier={p} />)}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-rule-2 p-8 text-center text-ink-2">Premier article bientôt.</p>
      )}
    </>
  );
}
