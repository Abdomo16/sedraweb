import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icons";
import { Container } from "@/components/ui/Layout";
import { getCategories } from "@/features/catalog/queries";

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
