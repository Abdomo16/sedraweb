import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getCategories, getProducts } from "@/features/catalog/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const base = siteConfig.url;
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/collections`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({
      url: `${base}/collections/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
