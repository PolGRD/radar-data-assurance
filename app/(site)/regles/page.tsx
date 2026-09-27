import type { Metadata } from "next";
import { Suspense } from "react";
import { NotConfigured } from "@/components/NotConfigured";
import { ReglesExplorer, type RegleVue } from "@/components/ReglesExplorer";
import { getEcheances, getImpacts, getRegles } from "@/lib/notion";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Règles de gestion" };

export default async function ReglesPage() {
  const [regles, impacts, echeances] = await Promise.all([getRegles(), getImpacts(), getEcheances()]);
  const echeanceParId = new Map(echeances.map((e) => [e.id, e]));
  const impactParId = new Map((impacts ?? []).map((i) => [i.id, i]));

  // Pour chaque règle : les impacts qui la citent, et les échéances de ces impacts (lien vers la frise).
  const vues: RegleVue[] = (regles ?? []).map((r) => {
    const ids = new Set([...r.impactIds, ...(impacts ?? []).filter((i) => i.regleIds.includes(r.id)).map((i) => i.id)]);
    const cites = [...ids].map((id) => impactParId.get(id)).filter((i) => i !== undefined);
    return {
      ...r,
      citations: cites.map((i) => ({
        impact: i.intitule,
        echeances: i.echeanceIds
          .map((id) => echeanceParId.get(id))
          .filter((e) => e !== undefined)
          .map((e) => ({ slug: e.slug, intitule: e.intitule })),
      })),
    };
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Règles de gestion</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Référentiel de règles candidates à des contrôles qualité de données. REG : réglementaire, PDT : produit, GES : gestion. C1 bloquant, C2 majeur, C3 mineur.
        </p>
      </div>
      <NotConfigured />
      {regles === null ? (
        <p role="alert" className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          La base « Règles de gestion » n&apos;est pas partagée avec l&apos;intégration « Radar site ». Dans Notion, ouvre la base, menu « ⋯ », « Connexions », puis ajoute « Radar site ».
        </p>
      ) : (
        <Suspense>
          <ReglesExplorer regles={vues} />
        </Suspense>
      )}
    </>
  );
}
