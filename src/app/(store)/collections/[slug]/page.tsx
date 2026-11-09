import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Faq } from "@/components/store/HomeSections";
import { ProductGrid } from "@/components/store/ProductCard";
import { Container } from "@/components/ui/Layout";
import { getCategories, getCategory, getProducts, getRedirect } from "@/features/catalog/queries";
import { defaultOgImages } from "@/lib/seo/og";
import { breadcrumbSchema, collectionSchema, faqSchema } from "@/lib/seo/schema";

// Unknown slugs (new categories/products added from the admin) render on demand.
export const instant = false;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: { canonical: `/collections/${category.slug}` },
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      images: defaultOgImages,
    },
  };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    const to = await getRedirect(`/collections/${slug}`);
    if (to) permanentRedirect(to);
    notFound();
  }

  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: category.slug }),
    getCategories(),
  ]);
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
        <nav aria-label="مسار التصفح" className="text-ink/75 mb-3 text-xs">
          <Link href="/">الرئيسية</Link> / <Link href="/collections">الأقسام</Link> /{" "}
          {category.shortName}
        </nav>
        <h1 className="font-display text-leaf-900 text-3xl leading-10 font-extrabold">
          {category.name}
        </h1>
        <p className="text-ink/80 mt-2 text-sm leading-8">{category.intro}</p>
        <h2 className="sr-only">منتجات {category.name}</h2>
        <div className="mt-6">
          {products.length ? (
            <ProductGrid products={products} eagerCount={2} />
          ) : (
            <p className="rounded-card bg-sand-100 p-6 text-center">منتجات القسم قريباً.</p>
          )}
        </div>
        <section aria-label="أقسام أخرى" className="mt-10">
          <h2 className="font-display text-leaf-900 mb-3 text-xl font-extrabold">أقسام أخرى</h2>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
            {categories
              .filter((c) => c.slug !== category.slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  className="bg-leaf-100 text-leaf-900 shrink-0 rounded-full px-4 py-2.5 text-sm font-bold"
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
