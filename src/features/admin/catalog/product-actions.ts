"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "../auth/guard";
import type { FormState } from "./category-actions";
import { refreshCatalog } from "./revalidate";
import { fieldErrors, productSchema, type ProductInput } from "./schemas";
import { parseInteger } from "./utils";

function readProductForm(formData: FormData) {
  const text = (k: string) => String(formData.get(k) ?? "");
  const json = (k: string): unknown => {
    try {
      return JSON.parse(text(k) || "[]");
    } catch {
      return [];
    }
  };
  return productSchema.safeParse({
    name: text("name"),
    slug: text("slug"),
    code: text("code"),
    categoryId: text("categoryId"),
    description: text("description"),
    material: text("material"),
    status: text("status") || "DRAFT",
    isNew: text("isNew") === "on",
    confirmed: text("confirmed") === "on",
    seoTitle: text("seoTitle"),
    seoDescription: text("seoDescription"),
    variants: json("variants"),
    images: json("images"),
  });
}

/** Unique SKUs: keep what the admin typed, otherwise "<code or slug>-<n>". */
async function resolveSkus(
  input: ProductInput,
  tx: Prisma.TransactionClient,
  productId?: string,
): Promise<string[]> {
  const base = input.code ?? input.slug;
  const wanted = input.variants.map((v, i) => v.sku || `${base}-${i + 1}`);
  const taken = await tx.variant.findMany({
    where: { sku: { in: wanted }, ...(productId ? { productId: { not: productId } } : {}) },
    select: { sku: true },
  });
  const used = new Set(taken.map((t) => t.sku));
  return wanted.map((sku) => (used.has(sku) ? `${sku}-${randomBytes(2).toString("hex")}` : sku));
}

async function validateBusinessRules(
  input: ProductInput,
  opts: { id?: string; needsReview: boolean },
): Promise<FormState | null> {
  const slugClash = await db.product.findFirst({
    where: { slug: input.slug, ...(opts.id ? { id: { not: opts.id } } : {}) },
  });
  if (slugClash) {
    return { errors: { slug: "الرابط ده مستخدم في منتج تاني" }, message: "الرابط مستخدم." };
  }
  if (input.code) {
    const codeClash = await db.product.findFirst({
      where: { code: input.code, ...(opts.id ? { id: { not: opts.id } } : {}) },
    });
    if (codeClash) {
      return { errors: { code: "الكود ده مستخدم في منتج تاني" }, message: "الكود مستخدم." };
    }
  }
  if (!(await db.category.findUnique({ where: { id: input.categoryId } }))) {
    return { errors: { categoryId: "القسم غير موجود" }, message: "اختار قسم صحيح." };
  }
  if (input.status === "ACTIVE") {
    if (input.images.length === 0) {
      return {
        errors: { images: "ضيف صورة واحدة على الأقل قبل النشر" },
        message: "المنتج محتاج صورة عشان يتنشر.",
      };
    }
    if (opts.needsReview && !input.confirmed) {
      return {
        errors: { confirmed: "أكّد إنك راجعت السعر والمقاسات والمخزون" },
        message: "المنتج ده مستورد بسعر تجريبي. راجع بياناته وأكّد قبل النشر.",
      };
    }
  }
  return null;
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = readProductForm(formData);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), message: "راجع الحقول الظاهرة بالأحمر." };
  }
  const input = parsed.data;
  const problem = await validateBusinessRules(input, { needsReview: false });
  if (problem) return problem;

  const category = await db.category.findUniqueOrThrow({ where: { id: input.categoryId } });
  const id = await db.$transaction(async (tx) => {
    const skus = await resolveSkus(input, tx);
    const product = await tx.product.create({
      data: {
        slug: input.slug,
        name: input.name,
        code: input.code,
        description: input.description,
        material: input.material,
        status: input.status,
        isNew: input.isNew,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        categoryId: input.categoryId,
        needsReview: false,
        images: {
          create: input.images.map((img, i) => ({ url: img.url, alt: img.alt, sortOrder: i + 1 })),
        },
        variants: {
          create: input.variants.map((v, i) => ({
            sku: skus[i],
            size: v.size,
            color: v.color,
            price: v.price,
            compareAtPrice: v.compareAt ?? null,
            stock: v.stock,
          })),
        },
      },
    });
    // A new product must not be shadowed by an old redirect with the same path.
    await tx.redirect.deleteMany({ where: { fromPath: `/products/${input.slug}` } });
    return product.id;
  });

  refreshCatalog({ products: [input.slug], categories: [category.slug] });
  redirect(`/admin/products/${id}?saved=1`);
}

export async function updateProduct(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const existing = await db.product.findUnique({
    where: { id },
    include: { category: true, variants: true },
  });
  if (!existing) return { message: "المنتج غير موجود." };

  const parsed = readProductForm(formData);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), message: "راجع الحقول الظاهرة بالأحمر." };
  }
  const input = parsed.data;
  const problem = await validateBusinessRules(input, { id, needsReview: existing.needsReview });
  if (problem) return problem;

  const newCategory = await db.category.findUniqueOrThrow({ where: { id: input.categoryId } });
  const keepIds = new Set(input.variants.map((v) => v.id).filter((v): v is string => Boolean(v)));
  const removed = existing.variants.filter((v) => !keepIds.has(v.id));

  try {
    await db.$transaction(async (tx) => {
      const skus = await resolveSkus(input, tx, id);
      await tx.product.update({
        where: { id },
        data: {
          slug: input.slug,
          name: input.name,
          code: input.code,
          description: input.description,
          material: input.material,
          status: input.status,
          isNew: input.isNew,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          categoryId: input.categoryId,
          // Publishing (or confirming) clears the "imported with placeholder data" flag.
          needsReview: existing.needsReview && !input.confirmed && input.status !== "ACTIVE",
        },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });
      if (input.images.length) {
        await tx.productImage.createMany({
          data: input.images.map((img, i) => ({
            productId: id,
            url: img.url,
            alt: img.alt,
            sortOrder: i + 1,
          })),
        });
      }

      if (removed.length) {
        await tx.variant.deleteMany({ where: { id: { in: removed.map((v) => v.id) } } });
      }
      for (const [i, v] of input.variants.entries()) {
        const data = {
          sku: skus[i],
          size: v.size,
          color: v.color,
          price: v.price,
          compareAtPrice: v.compareAt ?? null,
          stock: v.stock,
        };
        if (v.id && existing.variants.some((e) => e.id === v.id)) {
          await tx.variant.update({ where: { id: v.id }, data });
        } else {
          await tx.variant.create({ data: { ...data, productId: id } });
        }
      }

      if (input.slug !== existing.slug && existing.status === "ACTIVE") {
        await tx.redirect.deleteMany({ where: { fromPath: `/products/${input.slug}` } });
        await tx.redirect.updateMany({
          where: { toPath: `/products/${existing.slug}` },
          data: { toPath: `/products/${input.slug}` },
        });
        await tx.redirect.upsert({
          where: { fromPath: `/products/${existing.slug}` },
          update: { toPath: `/products/${input.slug}`, permanent: true },
          create: {
            fromPath: `/products/${existing.slug}`,
            toPath: `/products/${input.slug}`,
            permanent: true,
          },
        });
      } else {
        // Back to a normal live page: drop any redirect that would hide it.
        await tx.redirect.deleteMany({ where: { fromPath: `/products/${input.slug}` } });
      }
    });
  } catch {
    return {
      message: "تعذّر الحفظ. لو حذفت مقاس عليه طلبات سابقة، خلّي مخزونه 0 بدل ما تحذفه.",
    };
  }

  refreshCatalog({
    products: [existing.slug, input.slug],
    categories: [existing.category.slug, newCategory.slug],
  });
  redirect(`/admin/products/${id}?saved=1`);
}

/** One click: every size out of stock. The page stays live and indexable. */
export async function markSoldOut(id: string) {
  await requireAdmin();
  const p = await db.product.findUnique({ where: { id }, include: { category: true } });
  if (!p) return;
  await db.variant.updateMany({ where: { productId: id }, data: { stock: 0 } });
  refreshCatalog({ products: [p.slug], categories: [p.category.slug] });
  redirect("/admin/products?updated=1");
}

/** Back in stock: the same quantity for every size (fine-tune per size in the product page). */
export async function restockProduct(id: string, formData: FormData) {
  await requireAdmin();
  const qty = parseInteger(String(formData.get("qty") ?? "")) ?? 0;
  if (qty < 1 || qty > 100000) redirect("/admin/products?error=qty");
  const p = await db.product.findUnique({ where: { id }, include: { category: true } });
  if (!p) return;
  await db.variant.updateMany({ where: { productId: id }, data: { stock: qty } });
  refreshCatalog({ products: [p.slug], categories: [p.category.slug] });
  redirect("/admin/products?updated=1");
}

/** Redirect a retired product URL to its category so rankings and links are not lost. */
async function retire(tx: Prisma.TransactionClient, slug: string, categorySlug: string) {
  await tx.redirect.upsert({
    where: { fromPath: `/products/${slug}` },
    update: { toPath: `/collections/${categorySlug}`, permanent: true },
    create: {
      fromPath: `/products/${slug}`,
      toPath: `/collections/${categorySlug}`,
      permanent: true,
    },
  });
}

export async function setProductStatus(id: string, status: "ACTIVE" | "DRAFT") {
  await requireAdmin();
  const p = await db.product.findUnique({
    where: { id },
    include: { category: true, images: true, variants: true },
  });
  if (!p) return;
  if (status === "ACTIVE") {
    if (p.needsReview) redirect(`/admin/products/${id}?error=review`);
    if (p.images.length === 0 || p.variants.length === 0)
      redirect(`/admin/products/${id}?error=incomplete`);
  }
  await db.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: { status } });
    if (status === "ACTIVE") {
      await tx.redirect.deleteMany({ where: { fromPath: `/products/${p.slug}` } });
    }
  });
  refreshCatalog({ products: [p.slug], categories: [p.category.slug] });
  redirect("/admin/products?updated=1");
}

/** Hide the product but keep it recoverable. A published page redirects to its category. */
export async function archiveProduct(id: string) {
  await requireAdmin();
  const p = await db.product.findUnique({ where: { id }, include: { category: true } });
  if (!p) return;
  await db.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    if (p.status === "ACTIVE") await retire(tx, p.slug, p.category.slug);
  });
  refreshCatalog({ products: [p.slug], categories: [p.category.slug] });
  redirect("/admin/products?archived=1");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const p = await db.product.findUnique({ where: { id }, include: { category: true } });
  if (!p) return;
  try {
    await db.$transaction(async (tx) => {
      await tx.product.delete({ where: { id } });
      if (p.status === "ACTIVE" || p.status === "ARCHIVED") {
        await retire(tx, p.slug, p.category.slug);
      }
    });
  } catch {
    redirect(`/admin/products/${id}?error=has-orders`);
  }
  refreshCatalog({ products: [p.slug], categories: [p.category.slug] });
  redirect("/admin/products?deleted=1");
}
