import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoteBlocks } from "@/components/NoteBlocks";
import { PAGE_A_PROPOS } from "@/lib/config";
import { getContenuPage } from "@/lib/notion";

export const revalidate = 3600;
export const metadata: Metadata = { title: "À propos", alternates: { canonical: "/a-propos" } };

// Le texte s'écrit dans la page Notion « À propos (blog public) » ; tant qu'elle est vide, la page n'existe pas.
export default async function AProposPage() {
  const contenu = await getContenuPage(PAGE_A_PROPOS);
  if (!contenu.length) notFound();
  return (
    <article className="space-y-8">
      <h1 className="text-[2.25rem] font-bold leading-tight tracking-[-0.025em]">À propos</h1>
      <div className="text-[1.0625rem]"><NoteBlocks blocks={contenu} /></div>
    </article>
  );
}
