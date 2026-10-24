// Articles du blog public : sélection, regroupement en almanach, flux RSS.
import type { ArticleBlog } from "./types";

// Date affichée et triée : la date de publication saisie, sinon le jour de création de la page.
export function dateArticle(a: Pick<ArticleBlog, "date" | "creation">): string {
  return a.date ?? a.creation.slice(0, 10);
}

// Le public ne voit que les articles « Publié » dont la date est arrivée : une date future vaut programmation.
export function articlesPublies(articles: ArticleBlog[], today: string): ArticleBlog[] {
  return articles
    .filter((a) => a.statut === "Publié" && dateArticle(a) <= today)
    .sort((a, b) => dateArticle(b).localeCompare(dateArticle(a)));
}

const moisFormatter = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

export function parMois(articles: ArticleBlog[]): { cle: string; libelle: string; articles: ArticleBlog[] }[] {
  const groupes = new Map<string, ArticleBlog[]>();
  for (const a of [...articles].sort((x, y) => dateArticle(y).localeCompare(dateArticle(x)))) {
    const cle = dateArticle(a).slice(0, 7);
    groupes.set(cle, [...(groupes.get(cle) ?? []), a]);
  }
  return [...groupes].map(([cle, liste]) => ({ cle, libelle: moisFormatter.format(new Date(`${cle}-01T00:00:00Z`)), articles: liste }));
}

const echapper = (texte: string) =>
  texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function fluxRss(articles: ArticleBlog[], site: string): string {
  const items = articles.map((a) => {
    const lien = `${site}/blog/${a.adresse}`;
    return [
      "    <item>",
      `      <title>${echapper(a.titre)}</title>`,
      `      <link>${lien}</link>`,
      `      <guid isPermaLink="true">${lien}</guid>`,
      `      <pubDate>${new Date(`${dateArticle(a)}T00:00:00Z`).toUTCString()}</pubDate>`,
      a.resume && `      <description>${echapper(a.resume)}</description>`,
      ...[...a.piliers, ...a.tags].map((c) => `      <category>${echapper(c)}</category>`),
      "    </item>",
    ].filter(Boolean).join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Radar Data Assurance</title>",
    `    <link>${site}/blog</link>`,
    `    <atom:link href="${site}/blog/rss.xml" rel="self" type="application/rss+xml" />`,
    "    <description>Data gouvernance, IA et assurance de personnes.</description>",
    "    <language>fr-FR</language>",
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

// Ce que seul l'auteur voit : articles en relecture et articles programmés, du plus proche au plus lointain.
export function articlesEnAttente(articles: ArticleBlog[], today: string): ArticleBlog[] {
  const enLigne = new Set(articlesPublies(articles, today).map((a) => a.id));
  return articles.filter((a) => !enLigne.has(a.id)).sort((a, b) => dateArticle(a).localeCompare(dateArticle(b)));
}
