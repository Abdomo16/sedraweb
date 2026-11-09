import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductCarousel, ProductGrid } from "@/components/store/ProductCard";
import {
  AgeShortcuts,
  BrandText,
  CategoryCards,
  Faq,
  Hero,
  SectionTitle,
  TrustStrip,
  homeFaq,
} from "@/components/store/HomeSections";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";
import { getProduct, getProducts } from "@/features/catalog/queries";
import { faqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [fresh, popular, heroShe, heroBaby, heroKids] = await Promise.all([
    getProducts({ onlyNew: true, limit: 8 }),
    getProducts({ limit: 8 }),
    getProducts({ categorySlug: "he-and-she-girls", limit: 1 }),
    getProduct("baby-boy-102"),
    getProducts({ categorySlug: "girls", limit: 1 }),
  ]);
  // Three photos for the hero collage, picked from different age groups.
  const heroPhotos = [heroBaby, heroKids[0], heroShe[0]]
    .map((p) => p?.images[0])
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  return (
    <>
      <Hero photos={heroPhotos} />
      <AgeShortcuts />
      <CategoryCards />
      <section aria-labelledby="new-title" className="py-8">
        <Container>
          <SectionTitle
            id="new-title"
            action={
              <ButtonLink href="/collections" variant="soft">
                عرض الكل
              </ButtonLink>
            }
          >
            وصل حديثاً
          </SectionTitle>
          <ProductCarousel products={fresh} />
        </Container>
      </section>
      <TrustStrip />
      <section aria-labelledby="best-title" className="py-4">
        <Container>
          <SectionTitle id="best-title">الأكثر طلباً</SectionTitle>
          <ProductGrid products={popular} />
        </Container>
      </section>
      <BrandText />
      <Faq items={homeFaq} />
      <JsonLd data={faqSchema(homeFaq)} />
    </>
  );
}
