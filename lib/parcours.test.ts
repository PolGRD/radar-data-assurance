import { describe, expect, it } from "vitest";
import { etape } from "@/tests/fabriques";
import { progression, tableauParcours } from "./parcours";

const ids = (liste: { id: string }[]) => liste.map((x) => x.id);

describe("tableauParcours (page /parcours)", () => {
  it("range les compétences par pilier, dans l'ordre des piliers puis Transverse, et par statut", () => {
    const t = tableauParcours([
      etape({ id: "rgpd", pilier: "Transverse", statut: "En cours" }),
      etape({ id: "cdmp", pilier: "Data gouvernance", statut: "Fait" }),
      etape({ id: "aiact", pilier: "IA", statut: "À faire" }),
      etape({ id: "carto", pilier: "Data gouvernance", statut: "À faire" }),
    ]);
    expect(t.map((l) => l.pilier)).toEqual(["Data gouvernance", "IA", "Transverse"]);
    expect(ids(t[0].colonnes["À faire"])).toEqual(["carto"]);
    expect(ids(t[0].colonnes.Fait)).toEqual(["cdmp"]);
    expect(ids(t[2].colonnes["En cours"])).toEqual(["rgpd"]);
  });

  it("classe une compétence sans pilier en Transverse et sans statut en À faire", () => {
    const [ligne] = tableauParcours([etape({ id: "x", pilier: null, statut: null })]);
    expect(ligne.pilier).toBe("Transverse");
    expect(ids(ligne.colonnes["À faire"])).toEqual(["x"]);
  });

  it("calcule la progression de chaque pilier (compétences faites sur le total)", () => {
    const [ligne] = tableauParcours([
      etape({ id: "a", statut: "Fait" }), etape({ id: "b", statut: "En cours" }), etape({ id: "c" }),
    ]);
    expect(ligne).toMatchObject({ faits: 1, total: 3, pourcentage: 33 });
  });

  it("dans une colonne, met d'abord les échéances cibles les plus proches, puis celles sans date", () => {
    const [ligne] = tableauParcours([
      etape({ id: "sans-date" }),
      etape({ id: "decembre", echeanceCible: "2026-12-15" }),
      etape({ id: "novembre", echeanceCible: "2026-11-30" }),
    ]);
    expect(ids(ligne.colonnes["À faire"])).toEqual(["novembre", "decembre", "sans-date"]);
  });
});

describe("progression (tableau de bord)", () => {
  it("compte les compétences faites et en cours", () => {
    expect(progression([etape({ id: "a", statut: "Fait" }), etape({ id: "b", statut: "En cours" }), etape({ id: "c" })]))
      .toEqual({ faits: 1, enCours: 1, total: 3 });
  });
});
