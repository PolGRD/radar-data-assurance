import type { MetadataRoute } from "next";
import { articlesPublies, dateArticle } from "@/lib/articles";
import { PAGE_A_PROPOS, SITE_URL } from "@/lib/config";
import { getArticles, getContenuPage } from "@/lib/notion";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, aPropos] = await Promise.all([getArticles(), getContenuPage(PAGE_A_PROPOS)]);
  const publies = articlesPublies(articles, new Date().toISOString().slice(0, 10));
  return [
    { url: `${SITE_URL}/blog`, lastModified: publies[0] ? dateArticle(publies[0]) : undefined },
    ...publies.map((a) => ({ url: `${SITE_URL}/blog/${a.adresse}`, lastModified: dateArticle(a) })),
    ...(aPropos.length ? [{ url: `${SITE_URL}/a-propos` }] : []),
    { url: `${SITE_URL}/mentions-legales` },
  ];
}
