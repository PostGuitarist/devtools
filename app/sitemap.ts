import type { MetadataRoute } from "next";

import { tools } from "@/lib/tools-registry";

const BASE_URL = "https://devtools.zadenconnell.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/history`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = tools
    .filter((tool) => !tool.comingSoon)
    .map((tool) => ({
      url: `${BASE_URL}${tool.href}`,
      changeFrequency: "monthly",
      priority: tool.popular ? 0.9 : 0.7,
    }));

  return [...staticRoutes, ...toolRoutes];
}
