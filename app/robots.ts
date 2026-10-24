import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

// Seules les pages publiques (le blog et ce qui l'accompagne) sont indexables ; l'espace privé ne l'est pas.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/blog", "/a-propos", "/mentions-legales"], disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
