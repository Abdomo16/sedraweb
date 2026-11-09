import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductCarousel } from "@/components/store/ProductCard";
import { PurchasePanel } from "@/components/store/PurchasePanel";
import { Icon } from "@/components/ui/Icons";
import { ProductImage } from "@/components/store/ProductImage";
import { Container } from "@/components/ui/Layout";
import { formatEgp } from "@/components/ui/Price";
import {
  getCategory,
  getProduct,
  getProducts,
  getRelated,
  minPrice,
} from "@/features/catalog/queries";
import { defaultOgImages } from "@/lib/seo/og";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const category = await getCategory(product.categorySlug);
  const title = `${product.name} | ${category?.shortName ?? "بيجامات أطفال"}`;
  const description = `${product.name} من سيدرا كيدز${
    product.material ? `، ${product.material}` : ""
  }. السعر يبدأ من ${formatEgp(minPrice(product))}. شحن لكل المحافظات والدفع عند الاستلام.`;
  return {
    title,
    description,
    ...(product.status !== "ACTIVE" ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: product.images[0]
        ? [{ url: product.images[0].url, width: 961, height: 1280, alt: product.images[0].alt }]
        : defaultOgImages,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const category = await getCategory(product.categorySlug);
  if (!category) notFound();
  const related = await getRelated(product);

  // Without photos yet, show three illustrated placeholders.
  const slides = product.images.length ? product.images : [null, null, null];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "الرئيسية", path: "/" },
            { name: category.shortName, path: `/collections/${category.slug}` },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
          productSchema(product, category),
        ]}
      />
      <Container className="pt-4 pb-28 md:pb-10">
        <nav aria-label="مسار التصفح" className="text-ink/75 mb-3 text-xs">
          <Link href="/">الرئيسية</Link> /{" "}
          <Link href={`/collections/${category.slug}`}>{category.shortName}</Link>
        </nav>

        <div className="grid gap-6 md:grid-cols-2">
          <ul
            aria-label="صور المنتج"
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0"
          >
            {slides.map((_, i) => (
              <li key={i} className="w-[70%] shrink-0 snap-center md:w-auto">
                <ProductImage
                  product={product}
                  index={i}
                  sizes="(min-width: 768px) 50vw, 70vw"
                  priority={i === 0}
                  className="rounded-card"
                />
              </li>
            ))}
          </ul>

          <div>
            <h1 className="font-display text-leaf-900 text-3xl leading-10 font-extrabold">
              {product.name}
            </h1>
            <p className="text-ink/75 mt-1 text-sm">{category.name}</p>
            <div className="mt-4">
              <PurchasePanel variants={product.variants} />
            </div>

            <ul className="mt-6 grid gap-2 text-sm">
              <li className="flex items-center gap-2">
                <Icon name="truck" className="text-leaf-700 size-5" /> شحن لكل محافظات مصر
              </li>
              <li className="flex items-center gap-2">
                <Icon name="shield" className="text-leaf-700 size-5" /> دفع عند الاستلام أو أونلاين
              </li>
              <li className="flex items-center gap-2">
                <Icon name="return" className="text-leaf-700 size-5" /> استبدال المقاس متاح
              </li>
            </ul>

            <div className="mt-6 grid gap-2">
              {[
                { t: "وصف المنتج", c: product.description },
                {
                  t: "الخامة والعناية",
                  c: `${product.material ? `${product.material}. ` : ""}اغسل على درجة حرارة معتدلة.`,
                },
                {
                  t: "دليل المقاسات",
                  c: "اختار المقاس حسب سن الطفل. لو بين مقاسين، الأفضل المقاس الأكبر. دليل تفصيلي بالسنتيمتر هيتضاف قريباً.",
                },
              ].map((x, i) => (
                <details
                  key={x.t}
                  open={i === 0}
                  className="group rounded-card shadow-soft bg-white px-4 py-3"
                >
                  <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between font-bold">
                    {x.t}
                    <Icon
                      name="plus"
                      className="text-leaf-700 size-5 transition-transform group-open:rotate-45"
                    />
                  </summary>
                  <p className="text-ink/80 pt-2 text-sm leading-7">{x.c}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <section aria-labelledby="rel-title" className="mt-10">
          <h2 id="rel-title" className="font-display text-leaf-900 mb-4 text-2xl font-extrabold">
            ممكن يعجبك كمان
          </h2>
          <ProductCarousel products={related} />
        </section>
      </Container>
    </>
  );
}
