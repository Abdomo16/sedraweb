import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/features/admin/auth/guard";
import { createProduct } from "@/features/admin/catalog/product-actions";
import { db } from "@/lib/db";

export default async function NewProductPage({ searchParams }: PageProps<"/admin/products/new">) {
  await requireAdmin();
  const sp = await searchParams;
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true, shortName: true },
  });
  const preselected = typeof sp.category === "string" ? sp.category : (categories[0]?.id ?? "");

  return (
    <div>
      <h1 className="font-display text-leaf-900 mb-4 text-2xl font-extrabold">إضافة منتج جديد</h1>
      <ProductForm
        action={createProduct}
        isNew
        categories={categories}
        initial={{
          name: "",
          slug: "",
          code: "",
          categoryId: preselected,
          description: "",
          material: "",
          status: "DRAFT",
          isNew: true,
          seoTitle: "",
          seoDescription: "",
          variants: [{ sku: "", size: "", color: "", price: "", compareAt: "", stock: "10" }],
          images: [],
        }}
      />
    </div>
  );
}
