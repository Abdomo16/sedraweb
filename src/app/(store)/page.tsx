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
import { getProducts } from "@/features/catalog/queries";
import { faqSchema } from "@/lib/seo/schema";

export default async function HomePage() {
  const [fresh, popular] = await Promise.all([
    getProducts({ onlyNew: true, limit: 8 }),
    getProducts({ limit: 8 }),
  ]);

  return (
    <>
      <Hero />
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
