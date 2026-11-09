import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { requireAdmin } from "@/features/admin/auth/guard";
import { updateCategory } from "@/features/admin/catalog/category-actions";
import { db } from "@/lib/db";

export default async function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const c = await db.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!c) notFound();

  return (
    <div>
      <h1 className="font-display text-leaf-900 mb-4 text-2xl font-extrabold">
        تعديل: {c.shortName || c.name}
      </h1>
      <CategoryForm
        action={updateCategory.bind(null, c.id)}
        isNew={false}
        productCount={c._count.products}
        initial={{
          name: c.name,
          shortName: c.shortName,
          slug: c.slug,
          description: c.description ?? "",
          ageLabel: c.ageLabel ?? "",
          ageBand: c.ageBand ?? "",
          gender: c.gender ?? "",
          brand: c.brand ?? "",
          seoTitle: c.seoTitle ?? "",
          seoDescription: c.seoDescription ?? "",
          sortOrder: String(c.sortOrder),
          isActive: c.isActive,
          image: c.image,
        }}
      />
    </div>
  );
}
