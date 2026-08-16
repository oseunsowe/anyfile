import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * plan.md §8.2 — keep result/upload/account URLs out of the index. These paths
 * can expose a user's own work in search results, so the rule lives here rather
 * than depending on per-page metadata being remembered.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/app/",
          "/account/",
          "/dashboard/",
          "/result/",
          "/f/",
          "/login",
          "/signup",
          "/*?file=",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
