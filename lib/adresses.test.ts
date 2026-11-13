import { describe, expect, it } from "vitest";
import { avecAdresses } from "./adresses";

describe("avecAdresses (adresse /blog/… de chaque article)", () => {
  it("prend le slug saisi dans Notion, nettoyé, et à défaut le titre", () => {
    const [a, b] = avecAdresses([
      { id: "1", titre: "AI Act et assurance", slug: " AI Act Assurance " },
      { id: "2", titre: "Qualité des données DSN", slug: "" },
    ]);
    expect(a.adresse).toBe("ai-act-assurance");
    expect(b.adresse).toBe("qualite-des-donnees-dsn");
  });

  it("rend l'adresse unique quand deux articles donneraient la même", () => {
    const [a, b] = avecAdresses([
      { id: "abcdef123", titre: "Solvabilité II", slug: "" },
      { id: "987654zzz", titre: "Solvabilité II", slug: "" },
    ]);
    expect(a.adresse).toBe("solvabilite-ii");
    expect(b.adresse).toBe("solvabilite-ii-987654");
  });
});
