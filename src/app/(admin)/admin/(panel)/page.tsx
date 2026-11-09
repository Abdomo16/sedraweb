import Link from "next/link";
import { requireAdmin } from "@/features/admin/auth/guard";
import { db } from "@/lib/db";

async function counts() {
  const [active, review, drafts, archived, soldOut, categories, hiddenCategories] =
    await Promise.all([
      db.product.count({ where: { status: "ACTIVE" } }),
      db.product.count({ where: { needsReview: true } }),
      db.product.count({ where: { status: "DRAFT" } }),
      db.product.count({ where: { status: "ARCHIVED" } }),
      db.product.count({
        where: { status: "ACTIVE", variants: { none: { stock: { gt: 0 } } } },
      }),
      db.category.count({ where: { isActive: true } }),
      db.category.count({ where: { isActive: false } }),
    ]);
  return { active, review, drafts, archived, soldOut, categories, hiddenCategories };
}

function Stat({
  label,
  value,
  href,
  tone = "bg-white",
}: {
  label: string;
  value: number;
  href?: string;
  tone?: string;
}) {
  const body = (
    <>
      <p className="text-ink/70 text-sm">{label}</p>
      <p className="font-display text-leaf-900 mt-1 text-3xl font-extrabold">
        {value.toLocaleString("ar-EG")}
      </p>
    </>
  );
  const cls = `rounded-card shadow-soft block p-4 ${tone}`;
  return href ? (
    <Link href={href} className={`${cls} transition-transform hover:-translate-y-0.5`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default async function AdminHome() {
  await requireAdmin();
  const c = await counts();
  return (
    <div>
      <h1 className="font-display text-leaf-900 text-2xl font-extrabold">أهلاً بيك</h1>
      <p className="text-ink/70 mt-1 text-sm">ملخص سريع للمتجر.</p>

      {c.review > 0 ? (
        <Link
          href="/admin/products?review=1"
          className="bg-sun-100 text-leaf-900 mt-5 block rounded-2xl p-4 text-sm font-bold"
        >
          فيه {c.review.toLocaleString("ar-EG")} منتج محتاج مراجعة (سعر ومقاسات ومخزون) قبل ما
          يتنشر. اضغط للمراجعة.
        </Link>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="منتجات منشورة" value={c.active} href="/admin/products?status=ACTIVE" />
        <Stat
          label="مسودات"
          value={c.drafts}
          href="/admin/products?status=DRAFT"
          tone="bg-sun-100"
        />
        <Stat
          label="نفدت من المخزون"
          value={c.soldOut}
          href="/admin/products?stock=out"
          tone="bg-rose-100"
        />
        <Stat label="مؤرشفة" value={c.archived} href="/admin/products?status=ARCHIVED" />
        <Stat
          label="أقسام ظاهرة"
          value={c.categories}
          href="/admin/categories"
          tone="bg-leaf-100"
        />
        <Stat label="أقسام مخفية" value={c.hiddenCategories} href="/admin/categories" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="bg-leaf-700 hover:bg-leaf-900 inline-flex min-h-11 items-center rounded-full px-6 text-sm font-bold text-white transition-colors"
        >
          إضافة منتج
        </Link>
        <Link
          href="/admin/categories/new"
          className="bg-leaf-100 text-leaf-900 inline-flex min-h-11 items-center rounded-full px-6 text-sm font-bold"
        >
          إضافة قسم
        </Link>
      </div>
    </div>
  );
}
