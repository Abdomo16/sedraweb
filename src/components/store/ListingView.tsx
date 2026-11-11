import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Pagination } from "@/components/store/Pagination";
import { ProductGrid } from "@/components/store/ProductCard";
import { Container } from "@/components/ui/Layout";
import { productsPerPage } from "@/config/home";
import { getCategories, getProducts } from "@/features/catalog/queries";
import { defaultOgImages } from "@/lib/seo/og";
import { breadcrumbSchema } from "@/lib/seo/schema";

/** Two listings share this view: every product, and only the new arrivals. */
export type Listing = "all" | "new";

const meta: Record<
  Listing,
  { base: string; heading: string; title: string; description: string; crumb: string }
> = {
  all: {
    base: "/collections",
    heading: "كل الأقسام",
    title: "كل الأقسام | بيجامات أطفال ورضع",
    description:
      "تصفح كل بيجامات سيدرا كيدز للرضع والأطفال والكبار، بنات وولاد، بقطن ناعم وشحن لكل المحافظات.",
    crumb: "الأقسام",
  },
  new: {
    base: "/collections/new",
    heading: "وصل حديثاً",
    title: "وصل حديثاً | أحدث بيجامات الأطفال",
    description:
      "أحدث بيجامات وهوم وير سيدرا كيدز للرضع والأطفال والكبار، بنات وولاد، بقطن ناعم وشحن لكل المحافظات.",
    crumb: "وصل حديثاً",
  },
};

/** Page 1 is the plain listing URL; later pages live at `<listing>/page/2`. */
export function listingHref(kind: Listing, page: number) {
  const { base } = meta[kind];
  return page <= 1 ? base : `${base}/page/${page}`;
}

export function listingMetadata(kind: Listing, page: number): Metadata {
  const m = meta[kind];
  const title = page > 1 ? m.title.replace(" |", ` - صفحة ${page.toLocaleString("ar-EG")} |`) : m.title;
  return {
    title,
    description: m.description,
    alternates: { canonical: listingHref(kind, page) },
    openGraph: { title: m.title, description: m.description, images: defaultOgImages },
  };
}

export async function ListingView({ kind, page }: { kind: Listing; page: number }) {
  const m = meta[kind];
  const [categories, all] = await Promise.all([
    getCategories(),
    getProducts(kind === "new" ? { onlyNew: true } : undefined),
  ]);
  const totalPages = Math.max(1, Math.ceil(all.length / productsPerPage));
  if (page > totalPages) notFound();
  const products = all.slice((page - 1) * productsPerPage, page * productsPerPage);

  return (
    <Container className="py-6">
      <JsonLd
        data={breadcrumbSchema([
          { name: "الرئيسية", path: "/" },
          { name: "الأقسام", path: "/collections" },
          ...(kind === "new" ? [{ name: m.crumb, path: m.base }] : []),
        ])}
      />
      <h1 className="font-display text-leaf-900 text-3xl font-extrabold">{m.heading}</h1>
      <nav
        aria-label="الأقسام"
        className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2"
      >
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="bg-leaf-100 text-leaf-900 shrink-0 rounded-full px-4 py-2.5 text-sm font-bold"
          >
            {c.shortName}
          </Link>
        ))}
      </nav>
      <div className="mt-6">
        {products.length ? (
          <ProductGrid products={products} eagerCount={page === 1 ? 2 : 0} />
        ) : (
          <p className="rounded-card bg-sand-100 p-6 text-center">منتجات جديدة قريباً.</p>
        )}
      </div>
      <Pagination current={page} total={totalPages} hrefFor={(p) => listingHref(kind, p)} />
    </Container>
  );
}
