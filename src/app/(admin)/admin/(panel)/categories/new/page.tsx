import { CategoryForm } from "@/components/admin/CategoryForm";
import { requireAdmin } from "@/features/admin/auth/guard";
import { createCategory } from "@/features/admin/catalog/category-actions";

export default async function NewCategoryPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="font-display text-leaf-900 mb-4 text-2xl font-extrabold">إضافة قسم جديد</h1>
      <CategoryForm
        action={createCategory}
        isNew
        initial={{
          name: "",
          shortName: "",
          slug: "",
          description: "",
          ageLabel: "",
          ageBand: "",
          gender: "",
          brand: "",
          seoTitle: "",
          seoDescription: "",
          sortOrder: "50",
          isActive: true,
          image: null,
        }}
      />
    </div>
  );
}
