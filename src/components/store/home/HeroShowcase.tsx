import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Container } from "@/components/ui/Layout";
import { heroSlides } from "@/config/home";
import { getCategories } from "@/features/catalog/queries";
import { HeroSlider, type HeroSlide } from "./HeroSlider";

const points = [
  { icon: "truck", text: "شحن لكل المحافظات" },
  { icon: "shield", text: "الدفع عند الاستلام" },
  { icon: "check", text: "مقاسات واضحة" },
] as const;

/**
 * The first screen. The headline is real text (what search engines read and what loads
 * first); the photos come from the category covers, so the owner changes them from the admin.
 */
export async function HeroShowcase() {
  const categories = await getCategories();
  const slides: HeroSlide[] = [];
  for (const s of heroSlides) {
    const c = categories.find((x) => x.slug === s.category);
    if (c?.image) {
      slides.push({
        src: c.image,
        alt: c.name,
        href: `/collections/${c.slug}`,
        eyebrow: s.eyebrow,
        title: `تسوّق ${c.shortName}`,
      });
    }
  }

  return (
    <section className="bg-cream relative overflow-hidden">
      <Container className="relative grid items-center gap-5 pt-4 pb-10 md:grid-cols-[1fr_26rem] md:gap-12 md:py-14 lg:grid-cols-[1fr_34rem] lg:gap-20">
        <div className="order-2 md:order-1">
          <p className="text-leaf-700 mb-3 text-sm font-bold tracking-wide">
            هوم وير وبيجامات أطفال
          </p>
          <h1 className="font-display text-leaf-900 text-3xl leading-[1.5] font-extrabold md:text-5xl md:leading-[1.4]">
            نوم هادي، وصباح مليان لعب
          </h1>
          <p className="text-ink/80 mt-4 max-w-xl text-base leading-8 md:text-lg">
            هوم وير وبيجامات ناعمة للأطفال من 6 شهور لـ 16 سنة، بتصاميم مبهجة ومقاسات واضحة. اطلب
            دلوقتي والدفع عند الاستلام.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/collections" size="lg">
              تسوّق دلوقتي
            </ButtonLink>
            <ButtonLink href="/collections/girls" variant="ghost" size="lg">
              بناتي
            </ButtonLink>
            <ButtonLink href="/collections/boys" variant="ghost" size="lg">
              ولادي
            </ButtonLink>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
            {points.map((p) => (
              <li key={p.text} className="text-leaf-900 flex items-center gap-2">
                <Icon name={p.icon} className="text-leaf-700 size-5" />
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[19rem] md:order-2 md:max-w-none">
          <div className="relative">
            {slides.length ? (
              <HeroSlider slides={slides} />
            ) : (
              <ImagePlaceholder tone="sun" label="بيجامات أطفال" className="rounded-2xl" />
            )}
          </div>
        </div>
      </Container>

    </section>
  );
}
