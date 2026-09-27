import type { Echeance, ImpactData, Regle, VeilleItem } from "./types";

// Modèle de la frise : chaque échéance embarque ses impacts, et chaque impact ses règles.
export type RegleLiee = Pick<Regle, "id" | "regle" | "controle" | "nature" | "criticite" | "domaine" | "referenceJuridique">;
export type ImpactLie = Omit<ImpactData, "regleIds"> & { regles: RegleLiee[] };
export type JalonFrise = Echeance & {
  impacts: ImpactLie[];
  veille: { id: string; titre: string }[];
};

export function construireFrise(
  echeances: Echeance[],
  impacts: ImpactData[],
  regles: Regle[],
  veille: VeilleItem[],
): JalonFrise[] {
  const reglesParId = new Map(regles.map((r) => [r.id, r]));
  const impactsParId = new Map(impacts.map((i) => [i.id, i]));
  const veilleParId = new Map(veille.map((v) => [v.id, v]));

  return echeances
    .filter((e) => e.date)
    .map((e) => {
      // La relation est bidirectionnelle : on accepte le lien quel que soit le côté où il a été saisi.
      const ids = new Set([...e.impactIds, ...impacts.filter((i) => i.echeanceIds.includes(e.id)).map((i) => i.id)]);
      const liens = [...ids]
        .map((id) => impactsParId.get(id))
        .filter((i): i is ImpactData => Boolean(i))
        .map(({ regleIds, ...i }) => ({
          ...i,
          regles: regleIds
            .map((id) => reglesParId.get(id))
            .filter((r): r is Regle => Boolean(r))
            .map(({ id, regle, controle, nature, criticite, domaine, referenceJuridique }) => ({
              id, regle, controle, nature, criticite, domaine, referenceJuridique,
            })),
        }));
      return {
        ...e,
        impacts: liens,
        // Seuls les éléments de veille visibles sur le site (Retenu ou Lu) sont affichés.
        veille: e.veilleIds.map((id) => veilleParId.get(id)).filter((v): v is VeilleItem => Boolean(v)).map((v) => ({ id: v.id, titre: v.titre })),
      };
    })
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
}
