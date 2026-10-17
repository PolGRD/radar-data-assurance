import { describe, expect, it } from "vitest";
import { article, echeance, impact, regle } from "@/tests/fabriques";
import { construireFrise, impactsDeVeille } from "./calendrier";

describe("construireFrise", () => {
  it("rattache un impact relié depuis la fiche de l'impact seulement", () => {
    const frise = construireFrise(
      [echeance({ id: "e1" })],
      [impact({ id: "i1", echeanceIds: ["e1"] })],
      [], [],
    );
    expect(frise[0].impacts.map((i) => i.id)).toEqual(["i1"]);
  });

  it("rattache un impact relié depuis la fiche de l'échéance seulement", () => {
    const frise = construireFrise([echeance({ id: "e1", impactIds: ["i1"] })], [impact({ id: "i1" })], [], []);
    expect(frise[0].impacts.map((i) => i.id)).toEqual(["i1"]);
  });

  it("n'affiche qu'une fois un impact relié des deux côtés", () => {
    const frise = construireFrise(
      [echeance({ id: "e1", impactIds: ["i1"] })],
      [impact({ id: "i1", echeanceIds: ["e1"] })],
      [], [],
    );
    expect(frise[0].impacts).toHaveLength(1);
  });

  it("ignore un impact relié mais absent de la base (non partagé ou supprimé)", () => {
    const frise = construireFrise([echeance({ id: "e1", impactIds: ["inconnu"] })], [], [], []);
    expect(frise[0].impacts).toEqual([]);
  });

  it("écarte les échéances sans date et trie les autres de la plus proche à la plus lointaine", () => {
    const frise = construireFrise(
      [
        echeance({ id: "tard", date: "2028-08-02" }),
        echeance({ id: "sans-date", date: null }),
        echeance({ id: "tot", date: "2025-02-02" }),
      ],
      [], [], [],
    );
    expect(frise.map((j) => j.id)).toEqual(["tot", "tard"]);
  });

  it("joint à chaque impact ses règles de gestion, sans les règles inconnues", () => {
    const frise = construireFrise(
      [echeance({ id: "e1" })],
      [impact({ id: "i1", echeanceIds: ["e1"], regleIds: ["r1", "supprimee"] })],
      [regle({ id: "r1", regle: "PASS de la bonne année", criticite: "C1" })],
      [],
    );
    expect(frise[0].impacts[0].regles).toEqual([
      expect.objectContaining({ id: "r1", regle: "PASS de la bonne année", criticite: "C1" }),
    ]);
  });

  it("ne cite que les articles de veille visibles sur le site", () => {
    // La liste fournie ne contient que les articles Retenu ou Lu : un article à trier en est absent.
    const frise = construireFrise(
      [echeance({ id: "e1", veilleIds: ["visible", "a-trier"] })],
      [], [],
      [article({ id: "visible", titre: "Omnibus numérique" })],
    );
    expect(frise[0].veille).toEqual([{ id: "visible", titre: "Omnibus numérique" }]);
  });
});

describe("impactsDeVeille", () => {
  it("réunit les impacts reliés depuis l'article et depuis la fiche de l'impact, sans doublon", () => {
    const impacts = [
      impact({ id: "depuis-article" }),
      impact({ id: "depuis-impact", veilleIds: ["a1"] }),
      impact({ id: "des-deux-cotes", veilleIds: ["a1"] }),
      impact({ id: "autre-article", veilleIds: ["a2"] }),
    ];
    const lies = impactsDeVeille({ id: "a1", impactIds: ["depuis-article", "des-deux-cotes"] }, impacts, []);
    expect(lies.map((i) => i.id).sort()).toEqual(["depuis-article", "depuis-impact", "des-deux-cotes"]);
  });
});
