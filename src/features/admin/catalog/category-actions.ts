"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "../auth/guard";
import { refreshCatalog } from "./revalidate";
import { categorySchema, fieldErrors } from "./schemas";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

function readCategoryForm(formData: FormData) {
  const text = (k: string) => String(formData.get(k) ?? "");
  let images: unknown = [];
  try {
    images = JSON.parse(text("images") || "[]");
  } catch {
    images = [];
  }
  return categorySchema.safeParse({
    name: text("name"),
    shortName: text("shortName"),
    slug: text("slug"),
    description: text("description"),
    ageLabel: text("ageLabel"),
    ageBand: text("ageBand"),
    gender: text("gender"),
    brand: text("brand"),
    seoTitle: text("seoTitle"),
    seoDescription: text("seoDescription"),
    sortOrder: text("sortOrder") || "0",
    isActive: text("isActive") === "on",
    images,
  });
}

export async function createCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = readCategoryForm(formData);
  if (!parsed.success)
    return { errors: fieldErrors(parsed.error), message: "راجع الحقول الظاهرة بالأحمر." };
  const input = parsed.data;

  if (await db.category.findUnique({ where: { slug: input.slug } })) {
    return { errors: { slug: "الرابط ده مستخدم في قسم تاني" }, message: "الرابط مستخدم." };
  }

  const { images, ...data } = input;
  await db.$transaction([
    db.category.create({ data: { ...data, image: images[0]?.url ?? null } }),
    // A fresh category must not be shadowed by an old redirect with the same path.
    db.redirect.deleteMany({ where: { fromPath: `/collections/${input.slug}` } }),
  ]);
  refreshCatalog({ categories: [input.slug] });
  redirect("/admin/categories?saved=1");
}

export async function updateCategory(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) return { message: "القسم غير موجود." };

  const parsed = readCategoryForm(formData);
  if (!parsed.success)
    return { errors: fieldErrors(parsed.error), message: "راجع الحقول الظاهرة بالأحمر." };
  const input = parsed.data;

  const clash = await db.category.findFirst({ where: { slug: input.slug, id: { not: id } } });
  if (clash) return { errors: { slug: "الرابط ده مستخدم في قسم تاني" }, message: "الرابط مستخدم." };

  const { images, ...data } = input;
  await db.$transaction(async (tx) => {
    await tx.category.update({ where: { id }, data: { ...data, image: images[0]?.url ?? null } });
    if (input.slug !== existing.slug) {
      // Keep the old URL working (301) so rankings and backlinks carry over.
      await tx.redirect.deleteMany({ where: { fromPath: `/collections/${input.slug}` } });
      // Avoid redirect chains: anything that pointed at the old URL now points at the new one.
      await tx.redirect.updateMany({
        where: { toPath: `/collections/${existing.slug}` },
        data: { toPath: `/collections/${input.slug}` },
      });
      await tx.redirect.upsert({
        where: { fromPath: `/collections/${existing.slug}` },
        update: { toPath: `/collections/${input.slug}`, permanent: true },
        create: {
          fromPath: `/collections/${existing.slug}`,
          toPath: `/collections/${input.slug}`,
          permanent: true,
        },
      });
    }
  });
  refreshCatalog({ categories: [existing.slug, input.slug] });
  redirect("/admin/categories?saved=1");
}

export async function toggleCategory(id: string) {
  await requireAdmin();
  const c = await db.category.findUnique({ where: { id } });
  if (!c) return;
  await db.category.update({ where: { id }, data: { isActive: !c.isActive } });
  refreshCatalog({ categories: [c.slug] });
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const c = await db.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!c) redirect("/admin/categories");
  if (c._count.products > 0) redirect("/admin/categories?error=has-products");
  await db.$transaction([
    db.category.delete({ where: { id } }),
    db.redirect.upsert({
      where: { fromPath: `/collections/${c.slug}` },
      update: { toPath: "/collections", permanent: true },
      create: { fromPath: `/collections/${c.slug}`, toPath: "/collections", permanent: true },
    }),
  ]);
  refreshCatalog({ categories: [c.slug] });
  redirect("/admin/categories?deleted=1");
}
