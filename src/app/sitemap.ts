import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getIndexableTools } from "@/lib/tools";

/**
 * Only pages that actually exist are listed.
 *
 * `getIndexableTools()` returns tools with status `live`, which is the §8.3
 * guardrail in practice: a generated tool page enters the sitemap once it has a
 * working interactive experience, not when its registry entry is written.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = getIndexableTools().map((tool) => ({
    url: absoluteUrl(`/${tool.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: tool.mvp ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...toolRoutes];
}
