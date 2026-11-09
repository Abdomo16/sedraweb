import Image from "next/image";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { dangerBtn, Notice, primaryBtn, softBtn, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/features/admin/auth/guard";
import { deleteCategory, toggleCategory } from "@/features/admin/catalog/category-actions";
import { db } from "@/lib/db";

const bands: Record<string, string> = {
  BABY: "بيبي",
  KIDS: "أطفال",
  OLDER: "كبار",
  TEEN: "مراهقين",
};
const genders: Record<string, string> = { GIRLS: "بنات", BOYS: "ولاد", UNISEX: "للجنسين" };

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  await requireAdmin();
  const sp = await searchParams;
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-leaf-900 text-2xl font-extrabold">الأقسام</h1>
        <Link href="/admin/categories/new" className={primaryBtn}>
          إضافة قسم
        </Link>
      </div>

      <div className="mt-4 grid gap-2">
        {sp.saved ? <Notice>تم حفظ القسم.</Notice> : null}
        {sp.deleted ? <Notice>تم حذف القسم.</Notice> : null}
        {sp.error === "has-products" ? (
          <Notice tone="error">
            مينفعش تحذف قسم فيه منتجات. انقل المنتجات لقسم تاني أو اخفي القسم.
          </Notice>
        ) : null}
      </div>

      <ul className="mt-4 grid gap-3">
        {categories.map((c) => (
          <li
            key={c.id}
            className="shadow-soft flex flex-wrap items-center gap-3 rounded-3xl bg-white p-3"
          >
            <div className="bg-leaf-50 relative size-16 shrink-0 overflow-hidden rounded-2xl">
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="64px"
                  unoptimized
                  className="object-cover object-top"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{c.name}</p>
              <p className="text-ink/70 truncate text-xs" dir="ltr">
                /collections/{c.slug}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <StatusBadge tone={c.isActive ? "ok" : "muted"}>
                  {c.isActive ? "ظاهر" : "مخفي"}
                </StatusBadge>
                <span>{c._count.products.toLocaleString("ar-EG")} منتج</span>
                {c.ageBand ? <span>{bands[c.ageBand]}</span> : null}
                {c.gender ? <span>{genders[c.gender]}</span> : null}
                {c.brand ? <span dir="ltr">{c.brand}</span> : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/categories/${c.id}`} className={softBtn}>
                تعديل
              </Link>
              <form action={toggleCategory.bind(null, c.id)}>
                <ConfirmButton
                  message={
                    c.isActive
                      ? "إخفاء القسم هيخفي منتجاته كمان من الموقع. متأكد؟"
                      : "إظهار القسم في الموقع؟"
                  }
                  className={softBtn}
                >
                  {c.isActive ? "إخفاء" : "إظهار"}
                </ConfirmButton>
              </form>
              {c._count.products === 0 ? (
                <form action={deleteCategory.bind(null, c.id)}>
                  <ConfirmButton
                    message="حذف القسم نهائياً؟ الرابط هيتحوّل لصفحة الأقسام."
                    className={dangerBtn}
                  >
                    حذف
                  </ConfirmButton>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
