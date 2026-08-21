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
    { url: absoluteUrl("/tools"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/plans"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/roadmap"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = getIndexableTools().map((tool) => ({
    url: absoluteUrl(`/${tool.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: tool.mvp ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...toolRoutes];
}
