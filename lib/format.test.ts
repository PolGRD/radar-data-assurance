import { describe, expect, it } from "vitest";
import { formatDate, referenceDate, slugify } from "./format";

describe("slugify (ancres de la frise, /calendrier#…)", () => {
  it("transforme un intitulé d'échéance en ancre lisible, sans accents ni ponctuation", () => {
    expect(slugify("AI Act : systèmes à haut risque de l'annexe III")).toBe("ai-act-systemes-a-haut-risque-de-l-annexe-iii");
    expect(slugify("IJSS AT/MP : abaissement du plafond")).toBe("ijss-at-mp-abaissement-du-plafond");
  });

  it("limite la longueur à 80 caractères", () => {
    expect(slugify("a".repeat(120))).toHaveLength(80);
  });

  it("renvoie une chaîne vide pour un intitulé sans lettre ni chiffre", () => {
    expect(slugify(" : – ! ")).toBe("");
  });
});

describe("formatDate", () => {
  it("affiche une date seule en français, sans décalage de jour", () => {
    expect(formatDate("2026-11-01")).toBe("1 nov. 2026");
  });

  it("affiche un horodatage à l'heure de Paris", () => {
    // 23 h 30 UTC le 31 décembre = 0 h 30 le 1er janvier à Paris.
    expect(formatDate("2026-12-31T23:30:00Z")).toBe("1 janv. 2027");
  });

  it("renvoie une chaîne vide pour une date absente ou invalide", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate("pas une date")).toBe("");
  });
});

describe("referenceDate", () => {
  it("prend la date de publication, et à défaut la date de collecte", () => {
    expect(referenceDate({ datePublication: "2026-10-05", dateCollecte: "2026-10-06T04:14:24Z" })).toBe("2026-10-05");
    expect(referenceDate({ datePublication: null, dateCollecte: "2026-10-06T04:14:24Z" })).toBe("2026-10-06T04:14:24Z");
  });
});
