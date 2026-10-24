import type { Metadata } from "next";
import { Badge, PilierBadge } from "@/components/Badge";
import { BarreProgression } from "@/components/BarreProgression";
import { EnTetePage } from "@/components/EnTetePage";
import { Feuillet } from "@/components/Feuillet";
import { IconeExterne } from "@/components/Icones";
import { NotConfigured } from "@/components/NotConfigured";
import { compteARebours } from "@/lib/format";
import { getParcours } from "@/lib/notion";
import { STATUTS_PARCOURS, progression, tableauParcours, type StatutParcours } from "@/lib/parcours";
import type { EtapeParcours } from "@/lib/types";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Parcours d'apprentissage" };

function Competence({ etape, statut, today }: { etape: EtapeParcours; statut: StatutParcours; today: string }) {
  const enRetard = etape.echeanceCible !== null && etape.echeanceCible < today && statut !== "Fait";
  return (
    <li className={`flex gap-3 rounded-lg border bg-sheet p-3 ${statut === "Fait" ? "border-rule opacity-80" : "border-rule"}`}>
      {etape.echeanceCible && <Feuillet date={etape.echeanceCible} taille="sm" ton={statut === "Fait" ? "passe" : "avenir"} />}
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className={`text-sm font-medium leading-snug ${statut === "Fait" ? "text-ink-2" : ""}`}>{etape.competence}</p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {etape.type && <Badge tone="outline">{etape.type}</Badge>}
          {etape.echeanceCible && statut !== "Fait" && (
            <span className={enRetard ? "font-semibold text-vermillon" : "text-ink-3"}>
              {enRetard ? `en retard, prévue ${compteARebours(today, etape.echeanceCible)}` : `cible ${compteARebours(today, etape.echeanceCible)}`}
            </span>
          )}
        </div>
        {etape.notes && <p className="text-xs leading-relaxed text-ink-2">{etape.notes}</p>}
        {etape.ressource && (
          <a href={etape.ressource} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-prusse underline dark:text-ink">
            Ressource<IconeExterne className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </li>
  );
}

export default async function ParcoursPage() {
  const etapes = await getParcours();
  const lignes = tableauParcours(etapes);
  const { faits, enCours, total } = progression(etapes);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <EnTetePage titre="Parcours d'apprentissage">
        {total
          ? `${faits} compétence${faits > 1 ? "s" : ""} acquise${faits > 1 ? "s" : ""}, ${enCours} en cours, sur ${total}. Le statut se change dans Notion.`
          : "Aucune compétence pour l'instant : ajoute-les dans la base « Parcours d'apprentissage » de Notion."}
      </EnTetePage>
      <NotConfigured />

      <div className="space-y-10">
        {lignes.map((ligne) => (
          <section key={ligne.pilier} aria-labelledby={`pilier-${ligne.pilier}`} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_16rem] sm:items-end">
              <h2 id={`pilier-${ligne.pilier}`} className="text-lg font-semibold">
                {ligne.pilier === "Transverse" ? "Transverse" : <PilierBadge pilier={ligne.pilier} />}
              </h2>
              <BarreProgression ligne={ligne} titre="Progression" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {STATUTS_PARCOURS.map((statut) => (
                <div key={statut} className={`rounded-xl bg-sheet-2 p-3 ring-1 ring-inset ring-rule ${ligne.colonnes[statut].length ? "" : "hidden md:block"}`}>
                  <h3 className="mb-2 flex items-baseline justify-between px-1 text-sm font-semibold text-ink-2">
                    {statut}
                    <span className="font-chiffres text-lg text-ink-3">{ligne.colonnes[statut].length}</span>
                  </h3>
                  {ligne.colonnes[statut].length ? (
                    <ul className="space-y-2">
                      {ligne.colonnes[statut].map((e) => <Competence key={e.id} etape={e} statut={statut} today={today} />)}
                    </ul>
                  ) : (
                    <p className="px-1 pb-1 text-xs text-ink-3">Rien ici.</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
