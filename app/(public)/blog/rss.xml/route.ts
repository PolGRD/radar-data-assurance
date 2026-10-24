import { articlesPublies, fluxRss } from "@/lib/articles";
import { SITE_URL } from "@/lib/config";
import { getArticles } from "@/lib/notion";

export const revalidate = 3600;

export async function GET() {
  const publies = articlesPublies(await getArticles(), new Date().toISOString().slice(0, 10));
  return new Response(fluxRss(publies, SITE_URL), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
