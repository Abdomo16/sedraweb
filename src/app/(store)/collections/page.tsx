import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductGrid } from "@/components/store/ProductCard";
import { Container } from "@/components/ui/Layout";
import { getCategories, getProducts } from "@/features/catalog/queries";
import { defaultOgImages } from "@/lib/seo/og";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "كل الأقسام | بيجامات أطفال ورضع",
  description:
    "تصفح كل بيجامات سيدرا كيدز للرضع والأطفال والكبار، بنات وولاد، بقطن ناعم وشحن لكل المحافظات.",
  alternates: { canonical: "/collections" },
  openGraph: {
    title: "كل الأقسام | بيجامات أطفال ورضع",
    description:
      "تصفح كل بيجامات سيدرا كيدز للرضع والأطفال والكبار، بنات وولاد، بقطن ناعم وشحن لكل المحافظات.",
    images: defaultOgImages,
  },
};

export default async function CollectionsPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <Container className="py-6">
      <JsonLd
        data={breadcrumbSchema([
          { name: "الرئيسية", path: "/" },
          { name: "الأقسام", path: "/collections" },
        ])}
      />
      <h1 className="font-display text-leaf-900 text-3xl font-extrabold">كل الأقسام</h1>
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
        <ProductGrid products={products} />
      </div>
    </Container>
  );
}
