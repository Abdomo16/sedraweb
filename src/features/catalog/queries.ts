import { categories, products } from "./mock";
import type { AgeBand, Category, Product } from "./types";

/**
 * Data access boundary. Pages only call these functions; Phase 4 replaces
 * the internals with Prisma without touching any page.
 */
export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return categories.find((c) => c.slug === slug);
}

export async function getCategoriesByAge(ageBand: AgeBand): Promise<Category[]> {
  return categories.filter((c) => c.ageBand === ageBand);
}

export async function getProducts(opts?: {
  categorySlug?: string;
  onlyNew?: boolean;
  limit?: number;
}): Promise<Product[]> {
  let list = products;
  if (opts?.categorySlug) list = list.filter((x) => x.categorySlug === opts.categorySlug);
  if (opts?.onlyNew) list = list.filter((x) => x.isNew);
  return opts?.limit ? list.slice(0, opts.limit) : list;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return products.find((x) => x.slug === slug);
}

export async function getRelated(product: Product, limit = 6): Promise<Product[]> {
  const same = products.filter(
    (x) => x.categorySlug === product.categorySlug && x.slug !== product.slug,
  );
  const rest = products.filter(
    (x) => x.categorySlug !== product.categorySlug && x.slug !== product.slug,
  );
  return [...same, ...rest].slice(0, limit);
}

export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function minCompare(product: Product): number | undefined {
  const v = product.variants.find((x) => x.compareAtPrice);
  return v?.compareAtPrice;
}
