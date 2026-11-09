import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ProductForm } from "@/components/admin/ProductForm";
import { dangerBtn, Notice, Section, softBtn } from "@/components/admin/ui";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/features/admin/auth/guard";
import {
  archiveProduct,
  deleteProduct,
  markSoldOut,
  updateProduct,
} from "@/features/admin/catalog/product-actions";
import { egpString } from "@/features/admin/catalog/utils";
import { db } from "@/lib/db";

const errors: Record<string, string> = {
  review: "المنتج ده محتاج مراجعة. افتح الحقول وأكّد المراجعة قبل النشر.",
  incomplete: "المنتج محتاج صورة ومقاس واحد على الأقل قبل النشر.",
  "has-orders": "مينفعش حذف المنتج لأن عليه طلبات سابقة. أرشفه بدل الحذف.",
};

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { id: "asc" } },
      },
    }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, name: true, shortName: true },
    }),
  ]);
  if (!product) notFound();

  const error = typeof sp.error === "string" ? errors[sp.error] : undefined;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-leaf-900 text-2xl font-extrabold">تعديل المنتج</h1>
        <div className="flex flex-wrap gap-2">
          {product.status === "ACTIVE" ? (
            <a
              href={`${siteConfig.url}/products/${product.slug}`}
              target="_blank"
              rel="noreferrer"
              className={softBtn}
            >
              عرض في الموقع
            </a>
          ) : null}
          <Link href="/admin/products" className={softBtn}>
            رجوع للقائمة
          </Link>
        </div>
      </div>

      <div className="mb-4 grid gap-2">
        {sp.saved ? <Notice>تم حفظ المنتج.</Notice> : null}
        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>

      <ProductForm
        action={updateProduct.bind(null, product.id)}
        isNew={false}
        needsReview={product.needsReview}
        categories={categories}
        initial={{
          name: product.name,
          slug: product.slug,
          code: product.code ?? "",
          categoryId: product.categoryId,
          description: product.description,
          material: product.material ?? "",
          status: product.status,
          isNew: product.isNew,
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            size: v.size,
            color: v.color ?? "",
            price: egpString(v.price),
            compareAt: egpString(v.compareAtPrice),
            stock: String(v.stock),
          })),
          images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
        }}
      />

      <div className="mt-8">
        <Section
          title="إجراءات"
          description="الأرشفة بتخفي المنتج وتقدر ترجعه. الحذف نهائي. في الحالتين الرابط القديم بيتحوّل لصفحة القسم عشان جوجل."
        >
          <div className="flex flex-wrap gap-3">
            <form action={markSoldOut.bind(null, product.id)}>
              <ConfirmButton
                message="تحويل كل المقاسات لحالة نفد؟ الصفحة هتفضل ظاهرة."
                className={softBtn}
              >
                نفد المنتج
              </ConfirmButton>
            </form>
            {product.status !== "ARCHIVED" ? (
              <form action={archiveProduct.bind(null, product.id)}>
                <ConfirmButton
                  message="أرشفة المنتج؟ بيتشال من الموقع وتقدر ترجعه بعدين."
                  className={dangerBtn}
                >
                  أرشفة المنتج
                </ConfirmButton>
              </form>
            ) : null}
            <form action={deleteProduct.bind(null, product.id)}>
              <ConfirmButton message="حذف المنتج نهائياً؟ مفيش رجعة في ده." className={dangerBtn}>
                حذف نهائي
              </ConfirmButton>
            </form>
          </div>
        </Section>
      </div>
    </div>
  );
}
