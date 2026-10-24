import { describe, expect, it } from "vitest";
import { articleBlog } from "@/tests/fabriques";
import { articlesEnAttente, articlesPublies, fluxRss, parMois } from "./articles";

const ids = (liste: { id: string }[]) => liste.map((x) => x.id);

describe("articlesPublies (ce que voit le public)", () => {
  const articles = [
    articleBlog({ id: "ancien", date: "2026-09-02" }),
    articleBlog({ id: "recent", date: "2026-10-20" }),
    articleBlog({ id: "relecture", statut: "Relecture", date: "2026-10-21" }),
    articleBlog({ id: "brouillon", statut: "Brouillon", date: "2026-10-22" }),
    articleBlog({ id: "programme", date: "2026-11-15" }),
    articleBlog({ id: "sans-date", date: null, creation: "2026-10-10T09:00:00Z" }),
  ];

  it("ne garde que les articles Publié dont la date est passée, du plus récent au plus ancien", () => {
    expect(ids(articlesPublies(articles, "2026-10-24"))).toEqual(["recent", "sans-date", "ancien"]);
  });

  it("publie un article programmé le jour venu", () => {
    expect(ids(articlesPublies(articles, "2026-11-15"))).toContain("programme");
  });
});

describe("articlesEnAttente (page privée de relecture)", () => {
  it("liste les articles en relecture et les articles publiés à une date future, du plus proche au plus lointain", () => {
    const attente = articlesEnAttente([
      articleBlog({ id: "en-ligne", date: "2026-10-20" }),
      articleBlog({ id: "programme", date: "2026-11-15" }),
      articleBlog({ id: "relecture", statut: "Relecture", date: "2026-11-02" }),
    ], "2026-10-24");
    expect(ids(attente)).toEqual(["relecture", "programme"]);
  });
});

describe("parMois (accueil en almanach)", () => {
  it("regroupe par mois, du plus récent au plus ancien, avec un libellé en français", () => {
    const mois = parMois([
      articleBlog({ id: "a", date: "2026-11-12" }),
      articleBlog({ id: "b", date: "2026-11-03" }),
      articleBlog({ id: "c", date: "2026-10-18" }),
      articleBlog({ id: "d", date: "2025-12-01" }),
    ]);
    expect(mois.map((m) => m.libelle)).toEqual(["novembre 2026", "octobre 2026", "décembre 2025"]);
    expect(ids(mois[0].articles)).toEqual(["a", "b"]);
  });
});

describe("fluxRss", () => {
  const xml = fluxRss(
    [articleBlog({ id: "x", adresse: "ai-act", titre: "AI Act & assurance : <annexe III>", resume: "Ce qui change \"vraiment\"", date: "2026-10-20" })],
    "https://exemple.fr",
  );

  it("produit un flux RSS 2.0 avec un item par article et son adresse absolue", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<link>https://exemple.fr/blog/ai-act</link>");
    expect(xml).toContain('<guid isPermaLink="true">https://exemple.fr/blog/ai-act</guid>');
    expect(xml).toContain("<pubDate>Tue, 20 Oct 2026 00:00:00 GMT</pubDate>");
  });

  it("échappe les caractères spéciaux du XML", () => {
    expect(xml).toContain("<title>AI Act &amp; assurance : &lt;annexe III&gt;</title>");
    expect(xml).toContain("<description>Ce qui change &quot;vraiment&quot;</description>");
  });
});
