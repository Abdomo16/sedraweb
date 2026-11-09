import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { AgeBand, Category, Gender, Product, Tone } from "./types";
import { visibleStatuses } from "./visibility";

/**
 * Data access boundary. Pages only call these functions. Every read is
 * cached and tagged so an admin edit can refresh exactly what changed:
 *   revalidateTag("catalog", "max")      everything
 *   revalidateTag("category:<slug>", ...) one collection
 *   revalidateTag("product:<slug>", ...)  one product
 */

const toneByBand: Record<AgeBand, Record<Gender, Tone>> = {
  BABY: { GIRLS: "sun", BOYS: "sky", UNISEX: "mint" },
  KIDS: { GIRLS: "rose", BOYS: "mint", UNISEX: "sand" },
  OLDER: { GIRLS: "sun", BOYS: "sand", UNISEX: "mint" },
  TEEN: { GIRLS: "rose", BOYS: "sky", UNISEX: "mint" },
};

type CategoryRow = Prisma.CategoryGetPayload<object>;

function mapCategory(row: CategoryRow): Category {
  const ageBand = (row.ageBand ?? "KIDS") as AgeBand;
  const gender = (row.gender ?? "UNISEX") as Gender;
  return {
    slug: row.slug,
    name: row.name,
    shortName: row.shortName || row.name,
    legacyName: row.legacyName ?? undefined,
    ageBand,
    gender,
    ageLabel: row.ageLabel ?? undefined,
    image: row.image ?? undefined,
    brand: row.brand ?? undefined,
    intro: row.description ?? "",
    seoTitle: row.seoTitle ?? row.name,
    seoDescription: row.seoDescription ?? "",
    tone: toneByBand[ageBand][gender],
    updatedAt: row.updatedAt.toISOString(),
  };
}

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" } },
  variants: { orderBy: { id: "asc" } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function mapProduct(row: ProductRow): Product {
  const ageBand = (row.category.ageBand ?? "KIDS") as AgeBand;
  const gender = (row.category.gender ?? "UNISEX") as Gender;
  return {
    slug: row.slug,
    name: row.name,
    code: row.code ?? undefined,
    description: row.description,
    material: row.material ?? undefined,
    categorySlug: row.category.slug,
    tone: toneByBand[ageBand][gender],
    status: row.status,
    needsReview: row.needsReview,
    isNew: row.isNew,
    updatedAt: row.updatedAt.toISOString(),
    images: row.images.map((i) => ({ url: i.url, alt: i.alt })),
    variants: row.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color ?? undefined,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? undefined,
      stock: v.stock,
    })),
  };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "categories");
  const rows = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapCategory);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `category:${slug}`);
  const row = await db.category.findFirst({ where: { slug, isActive: true } });
  return row ? mapCategory(row) : undefined;
}

export async function getCategoriesByAge(ageBand: AgeBand): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "categories");
  const rows = await db.category.findMany({
    where: { ageBand, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapCategory);
}

export async function getProducts(opts?: {
  categorySlug?: string;
  onlyNew?: boolean;
  limit?: number;
}): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "products");
  if (opts?.categorySlug) cacheTag(`category:${opts.categorySlug}`);
  const rows = await db.product.findMany({
    where: {
      status: { in: visibleStatuses() },
      category: { isActive: true, ...(opts?.categorySlug ? { slug: opts.categorySlug } : {}) },
      ...(opts?.onlyNew ? { isNew: true } : {}),
    },
    include: productInclude,
    orderBy: [{ category: { sortOrder: "asc" } }, { createdAt: "desc" }, { id: "asc" }],
    ...(opts?.limit ? { take: opts.limit } : {}),
  });
  return rows.map(mapProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `product:${slug}`);
  const row = await db.product.findFirst({
    where: { slug, status: { in: visibleStatuses() }, category: { isActive: true } },
    include: productInclude,
  });
  return row ? mapProduct(row) : undefined;
}

export async function getRelated(product: Product, limit = 6): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "products", `product:${product.slug}`);
  const statuses = visibleStatuses();
  const same = await db.product.findMany({
    where: {
      status: { in: statuses },
      slug: { not: product.slug },
      category: { slug: product.categorySlug, isActive: true },
    },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  const rest =
    same.length < limit
      ? await db.product.findMany({
          where: {
            status: { in: statuses },
            slug: { not: product.slug },
            category: { slug: { not: product.categorySlug }, isActive: true },
          },
          include: productInclude,
          orderBy: { createdAt: "desc" },
          take: limit - same.length,
        })
      : [];
  return [...same, ...rest].map(mapProduct);
}

export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function minCompare(product: Product): number | undefined {
  const v = product.variants.find((x) => x.compareAtPrice);
  return v?.compareAtPrice;
}

/** Where a retired URL should go (set by the admin when a slug changes or a product is removed). */
export async function getRedirect(path: string): Promise<string | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("redirects");
  const row = await db.redirect.findUnique({ where: { fromPath: path } });
  return row?.toPath ?? null;
}
