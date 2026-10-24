import type { Metadata } from "next";
import { Suspense } from "react";
import { EnTetePage } from "@/components/EnTetePage";
import { FichesExplorer } from "@/components/FichesExplorer";
import { NotConfigured } from "@/components/NotConfigured";
import { getFiches, getVeilleItems } from "@/lib/notion";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Fiches de synthèse" };

export default async function FichesPage() {
  const [toutes, veille] = await Promise.all([getFiches(), getVeilleItems()]);
  // On ne compte que les éléments de veille retenus ou lus, les seuls qui ont une page sur le site.
  const visibles = new Set(veille.map((v) => v.id));
  const fiches = toutes.map((f) => ({ ...f, veilleIds: f.veilleIds.filter((id) => visibles.has(id)) }));
  return (
    <>
      <EnTetePage titre="Fiches de synthèse">
        Ce que j&apos;ai retenu sur un sujet, à partir de la veille. Ébauche, en cours ou stable : le statut dit si la fiche est fiable.
      </EnTetePage>
      <NotConfigured />
      <Suspense>
        <FichesExplorer fiches={fiches} />
      </Suspense>
    </>
  );
}
