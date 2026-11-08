import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/** Phase 1: static entries only. Products/collections/posts come from the DB in Phase 3. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
