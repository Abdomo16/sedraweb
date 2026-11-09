import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductCarousel, ProductGrid } from "@/components/store/ProductCard";
import { BrandText, Faq, SectionTitle, TrustStrip, homeFaq } from "@/components/store/HomeSections";
import { AgeTiles } from "@/components/store/home/AgeTiles";
import { CategoryChips } from "@/components/store/home/CategoryChips";
import { CategoryCircles } from "@/components/store/home/CategoryCircles";
import { HeroShowcase } from "@/components/store/home/HeroShowcase";
import { SocialProof } from "@/components/store/home/SocialProof";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";
import { mobileCategoryStyle } from "@/config/home";
import { getProducts } from "@/features/catalog/queries";
import { faqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [fresh, popular] = await Promise.all([
    getProducts({ onlyNew: true, limit: 8 }),
    getProducts({ limit: 8 }),
  ]);

  return (
    <>
      {mobileCategoryStyle === "circles" ? <CategoryCircles /> : <CategoryChips />}
      <HeroShowcase />
      <AgeTiles />
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
      <SocialProof />
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
