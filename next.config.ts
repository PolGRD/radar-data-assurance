import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Site privé : on demande aux moteurs de ne rien indexer, sur toutes les réponses.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
