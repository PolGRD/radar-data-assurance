import type { MetadataRoute } from "next";

// Site privé : aucune indexation.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
