import { describe, expect, it } from "vitest";
import { estPublic, redirectionVisiteur } from "./acces";

describe("estPublic (pages visibles sans mot de passe)", () => {
  it("ouvre le blog, ses articles et son flux, la page À propos, les mentions légales et le plan du site", () => {
    for (const chemin of ["/blog", "/blog/", "/blog/ai-act-assurance", "/blog/rss.xml", "/a-propos", "/mentions-legales", "/sitemap.xml"]) {
      expect(estPublic(chemin), chemin).toBe(true);
    }
  });

  it("garde ouvertes la connexion et sa route", () => {
    expect(estPublic("/connexion")).toBe(true);
    expect(estPublic("/api/login")).toBe(true);
  });

  it("protège tout le reste, y compris les chemins qui ressemblent à /blog", () => {
    for (const chemin of ["/", "/veille", "/veille/abc", "/calendrier", "/regles", "/fiches", "/parcours", "/relecture", "/relecture/x", "/blogue", "/blog-prive", "/api/revalidate", "/a-propos/../veille"]) {
      expect(estPublic(chemin), chemin).toBe(false);
    }
  });
});

describe("redirectionVisiteur (visiteur non connecté sur une page privée)", () => {
  it("envoie l'adresse racine du site vers le blog", () => {
    expect(redirectionVisiteur("/")).toBe("/blog");
  });

  it("envoie toute autre page privée vers la connexion", () => {
    expect(redirectionVisiteur("/veille")).toBe("/connexion");
    expect(redirectionVisiteur("/relecture/x")).toBe("/connexion");
  });
});
