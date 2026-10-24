import type { Metadata } from "next";
import Link from "next/link";
import { NavPublique } from "@/components/blog/NavPublique";
import { PAGE_A_PROPOS, SITE_URL } from "@/lib/config";
import { getContenuPage } from "@/lib/notion";

// Pages publiques : indexables, contrairement au reste du site.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  alternates: { types: { "application/rss+xml": `${SITE_URL}/blog/rss.xml` } },
  openGraph: { siteName: "Radar Data Assurance", locale: "fr_FR" },
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const aPropos = (await getContenuPage(PAGE_A_PROPOS)).length > 0;
  const liens = [{ href: "/blog", label: "Blog" }, ...(aPropos ? [{ href: "/a-propos", label: "À propos" }] : [])];
  return (
    <>
      <header className="bg-prusse text-prusse-ink">
        <nav className="mx-auto flex max-w-3xl flex-wrap items-end justify-between gap-x-6 px-4 pt-2" aria-label="Navigation du blog">
          <Link href="/blog" className="flex items-baseline gap-1.5 self-center py-2 text-white">
            <span className="font-chiffres text-2xl font-bold uppercase leading-none tracking-wide">Radar</span>
            <span className="text-sm font-medium text-white/80">Data Assurance</span>
          </Link>
          <NavPublique liens={liens} />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-10 pb-16">{children}</main>
      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-2 px-4 py-6 text-sm text-ink-3">
          <Link href="/mentions-legales" className="hover:text-ink hover:underline">Mentions légales</Link>
          <a href="/blog/rss.xml" className="hover:text-ink hover:underline">Flux RSS</a>
          <span>Blog personnel, sans publicité ni traceur.</span>
          <Link href="/connexion" className="ml-auto hover:text-ink hover:underline">Connexion</Link>
        </div>
      </footer>
    </>
  );
}
