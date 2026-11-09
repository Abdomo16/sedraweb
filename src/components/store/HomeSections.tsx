import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icons";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Container } from "@/components/ui/Layout";
import { getCategories } from "@/features/catalog/queries";
import type { ProductImage } from "@/features/catalog/types";

/** Section title with a small accent bar. Shared by home + listing pages. */
export function SectionTitle({
  id,
  children,
  action,
}: {
  id?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <h2
        id={id}
        className="font-display text-leaf-900 flex items-center gap-2.5 text-2xl leading-9 font-extrabold"
      >
        <span aria-hidden="true" className="bg-sun-400 inline-block h-6 w-1.5 rounded-full" />
        {children}
      </h2>
      {action}
    </div>
  );
}

function Sparkle({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`absolute ${className}`} aria-hidden="true">
      <path
        d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HeroPhoto({
  photo,
  className,
  delay,
  main = false,
}: {
  photo: ProductImage;
  className: string;
  delay: string;
  main?: boolean;
}) {
  return (
    <div className={`float absolute ${className}`} style={{ "--d": delay } as CSSProperties}>
      <div className="rounded-card shadow-soft bg-leaf-100 relative aspect-[3/4] overflow-hidden ring-4 ring-white">
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes="(min-width: 768px) 176px, 144px"
          loading="eager"
          fetchPriority={main ? "high" : "auto"}
          className="object-cover"
        />
      </div>
    </div>
  );
}

/** `photos`: three product photos (left, center, right). Falls back to illustrations. */
export function Hero({ photos = [] }: { photos?: ProductImage[] }) {
  return (
    <section className="bg-leaf-50 relative overflow-hidden">
      <Sparkle className="text-sun-400/70 start-6 top-8 size-5" />
      <Sparkle className="text-leaf-500/40 end-10 top-24 size-4" />
      <Sparkle className="text-sun-400/60 start-1/2 bottom-24 size-3" />
      <Container className="relative grid items-center gap-8 pt-8 pb-16 md:grid-cols-2 md:py-16">
        <div>
          <p className="bg-sun-100 text-leaf-900 mb-3 inline-block rounded-full px-3.5 py-1.5 text-xs font-bold">
            هوم وير أطفال
          </p>
          <h1 className="font-display text-leaf-900 text-4xl leading-[1.4] font-extrabold md:text-5xl">
            نوم هادي، وصباح{" "}
            <span className="decoration-sun-400 underline decoration-4 underline-offset-[10px]">
              مليان لعب
            </span>
          </h1>
          <p className="text-ink/80 mt-4 text-base leading-8">
            بيجامات قطن ناعمة للرضع والأطفال، بتصاميم مبهجة ومقاسات دقيقة. اطلب دلوقتي والدفع عند
            الاستلام.
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
        </div>

        <div className="relative mx-auto h-[22rem] w-full max-w-sm md:h-[27rem]">
          {photos.length >= 3 ? (
            <>
              <HeroPhoto
                photo={photos[0]}
                delay="0s"
                className="end-0 top-2 w-32 rotate-6 md:w-40"
              />
              <HeroPhoto
                photo={photos[1]}
                delay="-2s"
                main
                className="inset-x-0 top-12 z-[1] mx-auto w-40 md:w-48"
              />
              <HeroPhoto
                photo={photos[2]}
                delay="-4s"
                className="start-0 top-24 w-32 -rotate-6 md:w-40"
              />
            </>
          ) : (
            <>
              <div className="float absolute end-2 top-0 w-40 rotate-6 md:w-48">
                <ImagePlaceholder
                  tone="sun"
                  label="بيجامة بناتي"
                  className="rounded-card shadow-soft ring-4 ring-white"
                />
              </div>
              <div
                className="float absolute start-2 bottom-0 w-40 -rotate-6 md:w-48"
                style={{ "--d": "-3s" } as CSSProperties}
              >
                <ImagePlaceholder
                  tone="sky"
                  label="بيجامة ولادي"
                  className="rounded-card shadow-soft ring-4 ring-white"
                />
              </div>
            </>
          )}
          <p className="text-leaf-900 shadow-soft absolute inset-x-0 bottom-2 z-[2] mx-auto w-fit rounded-full bg-white px-4 py-2 text-xs font-bold whitespace-nowrap">
            هوم وير ناعم ومريح
          </p>
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

const ages = [
  {
    key: "BABY",
    label: "بيبي",
    sub: "رضع",
    girls: "baby-girls",
    boys: "baby-boys",
    bg: "bg-sun-100",
    ring: "ring-sun-400/50",
    icon: "moon",
  },
  {
    key: "KIDS",
    label: "أطفال",
    sub: "3 – 8",
    girls: "girls",
    boys: "boys",
    bg: "bg-leaf-100",
    ring: "ring-leaf-500/40",
    icon: "star",
  },
  {
    key: "OLDER",
    label: "كبار",
    sub: "الأكبر سناً",
    girls: "older-girls",
    boys: "older-boys",
    bg: "bg-sand-100",
    ring: "ring-[#b98a45]/40",
    icon: "cloud",
  },
] as const;

function AgeGlyph({ kind }: { kind: "moon" | "star" | "cloud" }) {
  const d = {
    moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z",
    star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z",
    cloud: "M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9.5 4.3 4.3 0 0 1 17.5 18H7Z",
  }[kind];
  return (
    <svg viewBox="0 0 24 24" className="text-leaf-700/70 size-6" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

export function AgeShortcuts() {
  return (
    <section aria-labelledby="age-title" className="py-8">
      <Container>
        <SectionTitle id="age-title">تسوّق حسب السن</SectionTitle>
        <ul className="grid grid-cols-3 gap-3">
          {ages.map((a) => (
            <li key={a.key} className="text-center">
              <div
                className={`ring-offset-cream mx-auto flex aspect-square w-full max-w-32 flex-col items-center justify-center gap-0.5 rounded-full ring-4 ring-offset-2 ${a.bg} ${a.ring}`}
              >
                <AgeGlyph kind={a.icon} />
                <span className="font-display text-leaf-900 text-xl leading-6 font-extrabold">
                  {a.label}
                </span>
                <span className="text-ink/70 text-xs">{a.sub}</span>
              </div>
              <div className="mt-3 flex justify-center gap-1.5 text-xs font-bold">
                <Link
                  href={`/collections/${a.girls}`}
                  className="shadow-soft hover:bg-sun-100 flex min-h-9 items-center rounded-full bg-white px-3.5"
                >
                  بنات
                </Link>
                <Link
                  href={`/collections/${a.boys}`}
                  className="shadow-soft hover:bg-leaf-100 flex min-h-9 items-center rounded-full bg-white px-3.5"
                >
                  ولاد
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export async function CategoryCards() {
  const categories = await getCategories();
  const oddCount = categories.length % 2 === 1;
  return (
    <section aria-labelledby="cats-title" className="py-4">
      <Container>
        <SectionTitle id="cats-title">الأقسام</SectionTitle>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((c, i) => {
            const wide = oddCount && i === categories.length - 1;
            return (
              <li key={c.slug} className={`reveal ${wide ? "col-span-2 md:col-span-1" : ""}`}>
                <Link
                  href={`/collections/${c.slug}`}
                  className={`rounded-card shadow-soft group block overflow-hidden bg-white transition-transform hover:-translate-y-0.5 ${
                    wide ? "flex items-center md:block" : ""
                  }`}
                >
                  <div className={wide ? "w-2/5 shrink-0 md:w-full" : ""}>
                    {c.image ? (
                      <div className="bg-leaf-50 relative aspect-[4/5] overflow-hidden">
                        <Image
                          src={c.image}
                          alt={c.name}
                          fill
                          sizes="(min-width: 768px) 25vw, 50vw"
                          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <ImagePlaceholder tone={c.tone} label={c.name} className="aspect-square" />
                    )}
                  </div>
                  <span className="flex flex-1 items-center justify-between gap-2 px-4 py-3 text-sm font-bold">
                    {c.shortName}
                    <span className="bg-leaf-100 text-leaf-700 flex size-7 items-center justify-center rounded-full">
                      <Icon name="chevron" className="size-4 rotate-180" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

const trust: { icon: IconName; title: string; text: string; bg: string }[] = [
  { icon: "leaf", title: "قطن ناعم", text: "خامات لطيفة على بشرة الأطفال", bg: "bg-leaf-50" },
  { icon: "truck", title: "شحن لكل مصر", text: "توصيل لباب البيت", bg: "bg-sky-100" },
  { icon: "return", title: "استبدال سهل", text: "لو المقاس مش مناسب", bg: "bg-sun-100" },
  { icon: "shield", title: "دفع آمن", text: "كاش أو فيزا أو إنستاباي", bg: "bg-sand-100" },
];

export function TrustStrip() {
  return (
    <section className="py-8">
      <Container>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {trust.map((t) => (
            <li key={t.title} className={`reveal rounded-card p-4 ${t.bg}`}>
              <span className="shadow-soft flex size-11 items-center justify-center rounded-full bg-white">
                <Icon name={t.icon} className="text-leaf-700 size-6" />
              </span>
              <p className="text-leaf-900 mt-3 font-bold">{t.title}</p>
              <p className="text-ink/70 text-xs leading-6">{t.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export const homeFaq = [
  {
    q: "إيه الخامة المستخدمة في البيجامات؟",
    a: "بنستخدم قطن ناعم ومريح على بشرة الأطفال، وبيتحمل الغسيل المتكرر بالغسالة.",
  },
  {
    q: "الشحن بياخد قد إيه؟",
    a: "الشحن لكل محافظات مصر عن طريق شركة شحن متخصصة، والمدة بتختلف حسب المحافظة وبنوضحها وقت الطلب.",
  },
  {
    q: "هل ينفع أستبدل لو المقاس مش مناسب؟",
    a: "أيوه، تقدر تستبدل المقاس خلال المدة الموضحة في سياسة الاستبدال بشرط إن المنتج بحالته.",
  },
  {
    q: "إزاي أدفع؟",
    a: "الدفع عند الاستلام متاح، وكمان فيزا ومحافظ إلكترونية وإنستاباي حسب المتاح وقت الطلب.",
  },
];

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section aria-labelledby="faq-title" className="py-8">
      <Container>
        <SectionTitle id="faq-title">أسئلة شائعة</SectionTitle>
        <div className="grid gap-2.5">
          {items.map((i) => (
            <details key={i.q} className="group rounded-card shadow-soft bg-white px-4 py-3">
              <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 font-bold">
                {i.q}
                <span className="bg-leaf-100 text-leaf-700 flex size-8 shrink-0 items-center justify-center rounded-full">
                  <Icon name="plus" className="size-4 transition-transform group-open:rotate-45" />
                </span>
              </summary>
              <p className="text-ink/80 pt-2 text-sm leading-7">{i.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

export async function BrandText() {
  const categories = await getCategories();
  return (
    <section className="py-4">
      <Container>
        <div className="rounded-card bg-leaf-50 p-5">
          <h2 className="font-display text-leaf-900 text-xl font-extrabold">
            سيدرا كيدز، بيجامات أطفال بجودة تستحقها عيلتك
          </h2>
          <p className="text-ink/80 mt-2 text-sm leading-8">
            في سيدرا كيدز بنقدم بيجامات وملابس منزلية للأطفال من الرضع لحد الكبار، بقطن ناعم وتفاصيل
            مدروسة للنوم واللعب. تقدر تتصفح{" "}
            {categories.slice(0, 3).map((c, i) => (
              <span key={c.slug}>
                {i > 0 ? "، " : ""}
                <Link href={`/collections/${c.slug}`} className="text-leaf-700 font-bold underline">
                  {c.name}
                </Link>
              </span>
            ))}{" "}
            وباقي الأقسام، وتطلب بالدفع عند الاستلام مع شحن لكل المحافظات.
          </p>
        </div>
      </Container>
    </section>
  );
}
