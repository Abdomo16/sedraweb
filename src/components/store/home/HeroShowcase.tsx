import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Container } from "@/components/ui/Layout";
import { heroSlides } from "@/config/home";
import { getCategories } from "@/features/catalog/queries";
import { Drop, Leaf, WaveLine } from "./BrandDecor";
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
    <section className="bg-leaf-50 relative overflow-hidden">
      <Drop className="-start-10 top-24 size-40 bg-sky-100 opacity-80" />
      <Drop className="bg-sun-100 end-[-3rem] top-10 size-48 opacity-90" />
      <Drop className="start-[12%] bottom-20 size-4 bg-sky-500/30" />
      <Drop className="bg-sun-400/60 end-[14%] bottom-28 size-3" />
      <Leaf className="text-leaf-500/25 start-[6%] top-8 size-14 rotate-12" />
      <Leaf className="text-leaf-500/20 end-[4%] bottom-24 size-20 -rotate-45" />
      <WaveLine className="start-[34%] top-6 hidden w-32 text-sky-500/30 md:block" />

      <Container className="relative grid items-center gap-5 pt-4 pb-14 md:grid-cols-[1fr_26rem] md:gap-12 md:py-14">
        <div className="order-2 md:order-1">
          <p className="bg-sun-100 text-leaf-900 mb-3 inline-block rounded-full px-3.5 py-1.5 text-xs font-bold">
            هوم وير وبيجامات أطفال
          </p>
          <h1 className="font-display text-leaf-900 text-3xl leading-[1.45] font-extrabold md:text-6xl md:leading-[1.35]">
            نوم هادي، وصباح{" "}
            <span className="decoration-sun-400 underline decoration-4 underline-offset-[10px]">
              مليان لعب
            </span>
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
                <span className="shadow-soft flex size-8 items-center justify-center rounded-full bg-white">
                  <Icon name={p.icon} className="text-leaf-700 size-4" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[19rem] md:order-2 md:max-w-none">
          <span
            aria-hidden="true"
            className="bg-sun-400/70 absolute -end-3 -top-3 hidden h-full w-full rotate-3 rounded-[2rem] md:block"
          />
          <span
            aria-hidden="true"
            className="absolute -start-3 top-3 hidden h-full w-full -rotate-3 rounded-[2rem] bg-sky-100 md:block"
          />
          <div className="relative">
            {slides.length ? (
              <HeroSlider slides={slides} />
            ) : (
              <ImagePlaceholder tone="sun" label="بيجامات أطفال" className="rounded-[2rem]" />
            )}
          </div>
        </div>
      </Container>

      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="text-cream absolute inset-x-0 bottom-0 h-8 w-full md:h-12"
        aria-hidden="true"
      >
        <path d="M0 48V24C240 0 480 0 720 20s480 24 720 4v24H0Z" fill="currentColor" />
      </svg>
    </section>
  );
}
