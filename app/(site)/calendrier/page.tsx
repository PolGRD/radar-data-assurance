import type { Metadata } from "next";
import { EnTetePage } from "@/components/EnTetePage";
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
      <EnTetePage titre="Calendrier réglementaire">
        Clique sur une échéance pour voir ses impacts chez l&apos;assureur, puis sur un impact pour voir les règles de gestion concernées.
      </EnTetePage>
      <NotConfigured />
      {nonPartagees.length > 0 && (
        <p role="alert" className="mb-6 rounded-lg border border-alerte/40 bg-alerte-soft p-3 text-sm text-alerte">
          {nonPartagees.join(" et ")} : base non partagée avec l&apos;intégration « Radar site ». Dans Notion, ouvre la base, menu « ⋯ », « Connexions », puis ajoute « Radar site ».
        </p>
      )}
      <Frise jalons={jalons} today={new Date().toISOString().slice(0, 10)} />
    </>
  );
}
