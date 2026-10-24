import { describe, expect, it } from "vitest";
import { compteARebours, ecart, feuillet, formatDate, referenceDate, slugify } from "./format";

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

describe("feuillet (date affichée comme une page d'éphéméride)", () => {
  it("découpe une date seule en jour de la semaine, quantième, mois et année", () => {
    expect(feuillet("2026-11-01")).toEqual({ jourSemaine: "dimanche", quantieme: "1", mois: "nov.", moisLong: "novembre", annee: "2026" });
  });

  it("lit un horodatage à l'heure de Paris", () => {
    expect(feuillet("2026-12-31T23:30:00Z")).toMatchObject({ quantieme: "1", mois: "janv.", annee: "2027" });
  });

  it("renvoie null pour une date absente ou invalide", () => {
    expect(feuillet(null)).toBeNull();
    expect(feuillet("pas une date")).toBeNull();
  });
});

describe("compteARebours", () => {
  it("dit l'écart en jours sous 45 jours, au singulier comme au pluriel", () => {
    expect(compteARebours("2026-10-24", "2026-10-24")).toBe("aujourd'hui");
    expect(compteARebours("2026-10-24", "2026-10-25")).toBe("dans 1 jour");
    expect(compteARebours("2026-10-24", "2026-10-20")).toBe("il y a 4 jours");
  });

  it("passe aux mois puis aux années pour les échéances lointaines", () => {
    expect(compteARebours("2026-10-24", "2027-04-24")).toBe("dans 6 mois");
    expect(compteARebours("2026-10-24", "2029-10-24")).toBe("dans 3 ans");
  });
});

describe("ecart", () => {
  it("sépare le nombre et l'unité, pour les afficher en deux tailles", () => {
    expect(ecart("2026-10-24", "2026-11-05")).toEqual({ nombre: 12, unite: "jours", futur: true });
    expect(ecart("2026-10-24", "2026-10-25")).toEqual({ nombre: 1, unite: "jour", futur: true });
    expect(ecart("2026-10-24", "2027-04-24")).toEqual({ nombre: 6, unite: "mois", futur: true });
    expect(ecart("2026-10-24", "2026-09-24")).toEqual({ nombre: 30, unite: "jours", futur: false });
  });
});
