import { describe, expect, it } from "vitest";
import { fiche } from "@/tests/fabriques";
import { avecAdresses } from "./fiches";
import { filtrerFiches } from "./filtres";

describe("avecAdresses (adresse /fiches/… de chaque fiche)", () => {
  it("prend le slug saisi dans Notion, nettoyé, et à défaut le titre", () => {
    const [a, b] = avecAdresses([
      { id: "1", titre: "AI Act et assurance", slug: " AI Act Assurance " },
      { id: "2", titre: "Qualité des données DSN", slug: "" },
    ]);
    expect(a.adresse).toBe("ai-act-assurance");
    expect(b.adresse).toBe("qualite-des-donnees-dsn");
  });

  it("rend l'adresse unique quand deux fiches donneraient la même", () => {
    const [a, b] = avecAdresses([
      { id: "abcdef123", titre: "Solvabilité II", slug: "" },
      { id: "987654zzz", titre: "Solvabilité II", slug: "" },
    ]);
    expect(a.adresse).toBe("solvabilite-ii");
    expect(b.adresse).toBe("solvabilite-ii-987654");
  });
});

describe("filtrerFiches", () => {
  const fiches = [
    fiche({ id: "ancienne", titre: "Solvabilité II vu de la data", piliers: ["Assurance de personnes"], tags: ["Qualité des données"], statut: "Stable", miseAJour: "2026-09-01T00:00:00Z" }),
    fiche({ id: "recente", titre: "AI Act et assurance", piliers: ["IA"], tags: ["Réglementation"], statut: "En cours", miseAJour: "2026-10-20T00:00:00Z" }),
  ];

  it("sans critère, renvoie tout, de la plus récemment modifiée à la plus ancienne", () => {
    expect(filtrerFiches(fiches, {}).map((f) => f.id)).toEqual(["recente", "ancienne"]);
  });

  it("filtre par pilier, tag et statut", () => {
    expect(filtrerFiches(fiches, { pilier: "IA" }).map((f) => f.id)).toEqual(["recente"]);
    expect(filtrerFiches(fiches, { tag: "Qualité des données" }).map((f) => f.id)).toEqual(["ancienne"]);
    expect(filtrerFiches(fiches, { statut: "Stable" }).map((f) => f.id)).toEqual(["ancienne"]);
  });

  it("recherche dans les titres sans tenir compte des accents", () => {
    expect(filtrerFiches(fiches, { q: "solvabilite" }).map((f) => f.id)).toEqual(["ancienne"]);
  });
});
