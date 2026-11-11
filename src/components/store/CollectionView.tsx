import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExpandableText } from "@/components/store/ExpandableText";
import { Faq } from "@/components/store/HomeSections";
import { Pagination } from "@/components/store/Pagination";
import { ProductGrid } from "@/components/store/ProductCard";
import { Container } from "@/components/ui/Layout";
import { productsPerPage } from "@/config/home";
import { getCategories, getCategory, getProducts, getRedirect } from "@/features/catalog/queries";
import { defaultOgImages } from "@/lib/seo/og";
import { breadcrumbSchema, collectionSchema, faqSchema } from "@/lib/seo/schema";

/** `/collections/x` is page 1; later pages live at `/collections/x/page/2`. */
export function collectionHref(slug: string, page: number) {
  return page <= 1 ? `/collections/${slug}` : `/collections/${slug}/page/${page}`;
}

export async function collectionMetadata(slug: string, page: number): Promise<Metadata> {
  const category = await getCategory(slug);
  if (!category) return {};
  const suffix = page > 1 ? ` - صفحة ${page.toLocaleString("ar-EG")}` : "";
  return {
    title: `${category.seoTitle}${suffix}`,
    description: category.seoDescription,
    alternates: { canonical: collectionHref(category.slug, page) },
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      images: defaultOgImages,
    },
  };
}

export async function CollectionView({ slug, page }: { slug: string; page: number }) {
  const category = await getCategory(slug);
  if (!category) {
    const to = await getRedirect(`/collections/${slug}`);
    if (to) permanentRedirect(to);
    notFound();
  }

  const [all, categories] = await Promise.all([
    getProducts({ categorySlug: category.slug }),
    getCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(all.length / productsPerPage));
  if (page > totalPages) notFound();
  const products = all.slice((page - 1) * productsPerPage, page * productsPerPage);

  const faq = [
    {
      q: `إيه المقاسات المتاحة في ${category.name}؟`,
      a: "المقاسات الموضحة في كل منتج، وبنوضح المتاح منها وقت الاختيار. لو محتار بين مقاسين اختار الأكبر.",
    },
    {
      q: "هل الدفع عند الاستلام متاح؟",
      a: "أيوه، الدفع عند الاستلام متاح لكل المحافظات.",
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "الرئيسية", path: "/" },
            { name: "الأقسام", path: "/collections" },
            { name: category.name, path: `/collections/${category.slug}` },
          ]),
          collectionSchema(category, products),
          faqSchema(faq),
        ]}
      />
      <Container className="py-6">
        <nav aria-label="مسار التصفح" className="mb-3">
          <Link
            href="/collections"
            className="tap text-leaf-900 hover:bg-leaf-100 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-leaf-900/15 bg-white px-3.5 text-xs font-bold"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5m6-6-6 6 6 6" />
            </svg>
            كل الأقسام
          </Link>
        </nav>
        <header className="bg-leaf-50 flex items-center gap-4 rounded-2xl p-3.5 md:max-w-2xl md:p-5">
          <div
            className={`relative size-20 shrink-0 overflow-hidden rounded-2xl md:size-28 ${
              category.image ? "bg-leaf-50" : "bg-sun-100"
            }`}
          >
            {category.image ? (
              <Image
                src={category.image}
                alt=""
                fill
                sizes="112px"
                priority
                className="object-cover object-[50%_12%]"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-leaf-900 text-2xl leading-9 font-extrabold md:text-4xl md:leading-[1.4]">
              <span aria-hidden="true">{category.shortName}</span>
              <span className="sr-only">{category.name}</span>
            </h1>
            <p className="text-leaf-700 mt-0.5 text-sm font-bold">
              {category.ageLabel ? `${category.ageLabel} · ` : ""}
              {all.length.toLocaleString("ar-EG")} {all.length === 1 ? "منتج" : "منتجات"}
            </p>
          </div>
        </header>
        <ExpandableText>{category.intro}</ExpandableText>
        <h2 className="sr-only">منتجات {category.name}</h2>
        <div className="mt-6">
          {products.length ? (
            <ProductGrid products={products} eagerCount={2} />
          ) : (
            <p className="rounded-card bg-sand-100 p-6 text-center">منتجات القسم قريباً.</p>
          )}
        </div>
        <Pagination
          current={page}
          total={totalPages}
          hrefFor={(p) => collectionHref(category.slug, p)}
        />
        <section aria-label="أقسام أخرى" className="mt-10">
          <h2 className="font-display text-leaf-900 mb-3 text-xl font-extrabold">أقسام أخرى</h2>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
            {categories
              .filter((c) => c.slug !== category.slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  className="border-leaf-900/15 text-leaf-900 hover:bg-leaf-50 shrink-0 rounded-lg border bg-white px-4 py-2.5 text-sm font-bold"
                >
                  {c.shortName}
                </Link>
              ))}
          </div>
        </section>
      </Container>
      <Faq items={faq} />
    </>
  );
}
