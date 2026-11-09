import Image from "next/image";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import {
  dangerBtn,
  inputCls,
  Notice,
  primaryBtn,
  softBtn,
  StatusBadge,
} from "@/components/admin/ui";
import { formatEgp } from "@/components/ui/Price";
import { requireAdmin } from "@/features/admin/auth/guard";
import {
  archiveProduct,
  markSoldOut,
  restockProduct,
  setProductStatus,
} from "@/features/admin/catalog/product-actions";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

const PAGE_SIZE = 20;

const statusLabel = { ACTIVE: "منشور", DRAFT: "مسودة", ARCHIVED: "مؤرشف" } as const;
const statusTone = { ACTIVE: "ok", DRAFT: "warn", ARCHIVED: "muted" } as const;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const category = one(sp.category);
  const status = one(sp.status);
  const stock = one(sp.stock);
  const review = one(sp.review) === "1";
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { categoryId: category } : {}),
    ...(status === "ACTIVE" || status === "DRAFT" || status === "ARCHIVED" ? { status } : {}),
    ...(stock === "out" ? { variants: { none: { stock: { gt: 0 } } } } : {}),
    ...(stock === "in" ? { variants: { some: { stock: { gt: 0 } } } } : {}),
    ...(review ? { needsReview: true } : {}),
  };

  const [total, products, categories] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { shortName: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { select: { price: true, stock: true } },
      },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, shortName: true } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (stock) params.set("stock", stock);
    if (review) params.set("review", "1");
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/admin/products${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-leaf-900 text-2xl font-extrabold">
          المنتجات <span className="text-ink/60 text-base">({total.toLocaleString("ar-EG")})</span>
        </h1>
        <Link href="/admin/products/new" className={primaryBtn}>
          إضافة منتج
        </Link>
      </div>

      <div className="mt-4 grid gap-2">
        {sp.updated ? <Notice>تم التحديث.</Notice> : null}
        {sp.archived ? <Notice>تم أرشفة المنتج. الرابط القديم بيتحوّل لصفحة القسم.</Notice> : null}
        {sp.deleted ? <Notice>تم حذف المنتج.</Notice> : null}
        {sp.error === "qty" ? <Notice tone="error">اكتب كمية صحيحة.</Notice> : null}
      </div>

      <form
        action="/admin/products"
        className="shadow-soft mt-4 grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-[2fr_1.2fr_1fr_1fr_auto]"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="ابحث بالاسم أو الكود"
          className={inputCls}
          aria-label="بحث"
        />
        <select name="category" defaultValue={category} className={inputCls} aria-label="القسم">
          <option value="">كل الأقسام</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.shortName}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className={inputCls} aria-label="الحالة">
          <option value="">كل الحالات</option>
          <option value="ACTIVE">منشور</option>
          <option value="DRAFT">مسودة</option>
          <option value="ARCHIVED">مؤرشف</option>
        </select>
        <select name="stock" defaultValue={stock} className={inputCls} aria-label="المخزون">
          <option value="">كل المخزون</option>
          <option value="in">متاح</option>
          <option value="out">نفد</option>
        </select>
        <button className={softBtn}>بحث</button>
        {review ? <input type="hidden" name="review" value="1" /> : null}
      </form>
      {review ? (
        <p className="mt-2 text-sm font-bold">
          المنتجات المحتاجة مراجعة فقط.{" "}
          <Link href="/admin/products" className="text-leaf-700 underline">
            عرض الكل
          </Link>
        </p>
      ) : null}

      <ul className="mt-4 grid gap-3">
        {products.map((p) => {
          const prices = p.variants.map((v) => v.price);
          const totalStock = p.variants.reduce((n, v) => n + v.stock, 0);
          const soldOut = totalStock === 0;
          const min = prices.length ? Math.min(...prices) : 0;
          const max = prices.length ? Math.max(...prices) : 0;
          return (
            <li
              key={p.id}
              className="shadow-soft flex flex-wrap items-center gap-3 rounded-3xl bg-white p-3"
            >
              <div className="bg-leaf-50 relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                {p.images[0] ? (
                  <Image
                    src={p.images[0].url}
                    alt={p.images[0].alt}
                    fill
                    sizes="64px"
                    unoptimized
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="block truncate font-bold hover:underline"
                >
                  {p.name}
                </Link>
                <p className="text-ink/70 mt-0.5 text-xs">
                  {p.category.shortName}
                  {p.code ? ` · كود ${p.code}` : ""}
                </p>
                <p className="mt-1 text-sm font-bold">
                  {prices.length
                    ? min === max
                      ? formatEgp(min)
                      : `${formatEgp(min)} - ${formatEgp(max)}`
                    : "بدون مقاسات"}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5">
                  <StatusBadge tone={statusTone[p.status]}>{statusLabel[p.status]}</StatusBadge>
                  {soldOut ? (
                    <StatusBadge tone="danger">نفد</StatusBadge>
                  ) : (
                    <StatusBadge tone="ok">مخزون {totalStock.toLocaleString("ar-EG")}</StatusBadge>
                  )}
                  {p.needsReview ? <StatusBadge tone="warn">محتاج مراجعة</StatusBadge> : null}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/products/${p.id}`} className={softBtn}>
                  تعديل
                </Link>
                {soldOut ? (
                  <form
                    action={restockProduct.bind(null, p.id)}
                    className="flex items-center gap-1"
                  >
                    <input
                      name="qty"
                      inputMode="numeric"
                      placeholder="كمية"
                      aria-label="الكمية"
                      dir="ltr"
                      className="border-leaf-700/25 min-h-11 w-16 rounded-xl border px-2 text-sm"
                    />
                    <button className={softBtn}>متاح</button>
                  </form>
                ) : (
                  <form action={markSoldOut.bind(null, p.id)}>
                    <ConfirmButton
                      message="تحويل كل مقاسات المنتج لحالة نفد؟ الصفحة هتفضل ظاهرة."
                      className={softBtn}
                    >
                      نفد
                    </ConfirmButton>
                  </form>
                )}
                {p.status === "ACTIVE" ? (
                  <form action={setProductStatus.bind(null, p.id, "DRAFT")}>
                    <ConfirmButton message="إخفاء المنتج من الموقع؟" className={softBtn}>
                      إخفاء
                    </ConfirmButton>
                  </form>
                ) : p.status === "DRAFT" ? (
                  <form action={setProductStatus.bind(null, p.id, "ACTIVE")}>
                    <button className={primaryBtn}>نشر</button>
                  </form>
                ) : null}
                {p.status !== "ARCHIVED" ? (
                  <form action={archiveProduct.bind(null, p.id)}>
                    <ConfirmButton
                      message="أرشفة المنتج؟ بيتشال من الموقع وتقدر ترجعه بعدين."
                      className={dangerBtn}
                    >
                      أرشفة
                    </ConfirmButton>
                  </form>
                ) : null}
              </div>
            </li>
          );
        })}
        {products.length === 0 ? (
          <li className="rounded-3xl bg-white p-8 text-center text-sm">مفيش منتجات بالشروط دي.</li>
        ) : null}
      </ul>

      {pages > 1 ? (
        <nav
          aria-label="الصفحات"
          className="mt-5 flex items-center justify-center gap-3 text-sm font-bold"
        >
          {page > 1 ? (
            <Link href={link(page - 1)} className={softBtn}>
              السابق
            </Link>
          ) : null}
          <span>
            {page.toLocaleString("ar-EG")} / {pages.toLocaleString("ar-EG")}
          </span>
          {page < pages ? (
            <Link href={link(page + 1)} className={softBtn}>
              التالي
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
