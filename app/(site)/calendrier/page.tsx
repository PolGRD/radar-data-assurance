import type { Metadata } from "next";
import { Frise } from "@/components/Frise";
import { NotConfigured } from "@/components/NotConfigured";
import { construireFrise } from "@/lib/calendrier";
import { getEcheances, getImpacts, getRegles, getVeilleItems } from "@/lib/notion";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Calendrier réglementaire" };

export default async function CalendrierPage() {
  const [echeances, impacts, regles, veille] = await Promise.all([getEcheances(), getImpacts(), getRegles(), getVeilleItems()]);
  const jalons = construireFrise(echeances, impacts ?? [], regles ?? [], veille);
  const nonPartagees = [impacts === null && "Impacts assureur", regles === null && "Règles de gestion"].filter(Boolean);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Calendrier réglementaire</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Clique sur une échéance pour voir ses impacts chez l&apos;assureur, puis sur un impact pour voir les règles de gestion concernées.
        </p>
      </div>
      <NotConfigured />
      {nonPartagees.length > 0 && (
        <p role="alert" className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {nonPartagees.join(" et ")} : base non partagée avec l&apos;intégration « Radar site ». Dans Notion, ouvre la base, menu « ⋯ », « Connexions », puis ajoute « Radar site ».
        </p>
      )}
      <Frise jalons={jalons} today={new Date().toISOString().slice(0, 10)} />
    </>
  );
}
