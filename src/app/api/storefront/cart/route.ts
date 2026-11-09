import { z } from "zod";
import type { CartLineView, MiniProduct, StorefrontCart } from "@/features/cart/types";
import { visibleStatuses } from "@/features/catalog/visibility";
import { loadShippingInfo } from "@/features/shipping/rates";
import { db } from "@/lib/db";
import { allow } from "@/lib/rate-limit";

const bodySchema = z.object({
  lines: z
    .array(z.object({ variantId: z.string().min(1).max(64), qty: z.number().int().min(1).max(99) }))
    .max(30),
  recent: z.array(z.string().max(80)).max(12).default([]),
});

const visibleProduct = () => ({
  status: { in: visibleStatuses() },
  category: { isActive: true },
});

type CardRow = {
  slug: string;
  name: string;
  images: { url: string; alt: string }[];
  variants: { price: number; compareAtPrice: number | null; stock: number }[];
};

function toMini(p: CardRow): MiniProduct {
  const prices = p.variants.map((v) => v.price);
  const cheapest = p.variants.reduce((a, b) => (a.price <= b.price ? a : b), p.variants[0]);
  return {
    slug: p.slug,
    name: p.name,
    price: prices.length ? Math.min(...prices) : 0,
    compareAt: cheapest?.compareAtPrice ?? undefined,
    image: p.images[0],
    inStock: p.variants.some((v) => v.stock > 0),
  };
}

const cardSelect = {
  slug: true,
  name: true,
  images: { orderBy: { sortOrder: "asc" as const }, take: 1, select: { url: true, alt: true } },
  variants: { select: { price: true, compareAtPrice: true, stock: true } },
};

/** Live cart data for the drawer and the cart page: always fresh, never cached. */
export async function POST(request: Request) {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";
  if (!allow(`cart:${ip}`, 90, 60_000)) {
    return Response.json({ error: "too many requests" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });
  const { lines, recent } = parsed.data;

  const ids = [...new Set(lines.map((l) => l.variantId))];
  const variants = ids.length
    ? await db.variant.findMany({
        where: { id: { in: ids }, product: visibleProduct() },
        include: {
          product: {
            select: {
              slug: true,
              name: true,
              categoryId: true,
              images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
            },
          },
        },
      })
    : [];
  const byId = new Map(variants.map((v) => [v.id, v]));

  const views: CartLineView[] = [];
  const missing: string[] = [];
  for (const line of lines) {
    const v = byId.get(line.variantId);
    if (!v) {
      missing.push(line.variantId);
      continue;
    }
    views.push({
      variantId: v.id,
      qty: line.qty,
      stock: v.stock,
      price: v.price,
      compareAt: v.compareAtPrice ?? undefined,
      name: v.product.name,
      size: v.size,
      color: v.color ?? undefined,
      image: v.product.images[0],
      slug: v.product.slug,
    });
  }

  const inCartSlugs = new Set(views.map((v) => v.slug));
  const categoryIds = [...new Set(variants.map((v) => v.product.categoryId))];

  const [suggestionRows, recentRows, shipping] = await Promise.all([
    db.product.findMany({
      where: {
        ...visibleProduct(),
        slug: { notIn: [...inCartSlugs] },
        variants: { some: { stock: { gt: 0 } } },
        ...(categoryIds.length ? { categoryId: { in: categoryIds } } : {}),
      },
      select: cardSelect,
      orderBy: [{ isNew: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
    recent.length
      ? db.product.findMany({
          where: { ...visibleProduct(), slug: { in: recent } },
          select: cardSelect,
        })
      : Promise.resolve([]),
    loadShippingInfo(),
  ]);

  const recentOrdered = recent
    .map((slug) => recentRows.find((r) => r.slug === slug))
    .filter((r): r is NonNullable<typeof r> => Boolean(r) && !inCartSlugs.has(r!.slug))
    .slice(0, 8);

  const body: StorefrontCart = {
    lines: views,
    missing,
    suggestions: suggestionRows.map(toMini),
    recent: recentOrdered.map(toMini),
    freeOver: shipping.freeOver,
  };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
