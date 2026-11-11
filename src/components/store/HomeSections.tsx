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
    <div className="mb-6 flex items-end justify-between gap-3">
      <h2
        id={id}
        className="font-display text-leaf-900 text-2xl leading-9 font-extrabold md:text-3xl"
      >
        {children}
      </h2>
      {action}
    </div>
  );
}

const trust: { icon: IconName; title: string; text: string }[] = [
  { icon: "leaf", title: "قطن ناعم", text: "خامات لطيفة على بشرة الأطفال" },
  { icon: "truck", title: "شحن لكل مصر", text: "توصيل لباب البيت" },
  { icon: "return", title: "استبدال سهل", text: "لو المقاس مش مناسب" },
  { icon: "shield", title: "دفع آمن", text: "كاش أو فيزا أو إنستاباي" },
];

export function TrustStrip() {
  return (
    <section className="py-10">
      <Container>
        <ul className="border-leaf-900/10 md:divide-leaf-900/10 grid grid-cols-2 gap-y-6 border-y py-6 md:grid-cols-4 md:divide-x md:divide-x-reverse">
          {trust.map((t) => (
            <li key={t.title} className="flex flex-col items-center px-3 text-center">
              <Icon name={t.icon} className="text-leaf-700 size-7" />
              <p className="text-leaf-900 mt-2.5 text-sm font-bold">{t.title}</p>
              <p className="text-ink/65 mt-0.5 text-xs leading-6">{t.text}</p>
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
      <Container size="narrow">
        <SectionTitle id="faq-title">أسئلة شائعة</SectionTitle>
        <div className="grid gap-2.5">
          {items.map((i) => (
            <details key={i.q} className="group rounded-card shadow-soft bg-white px-4 py-3">
              <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 font-bold">
                {i.q}
                <span className="text-leaf-700 flex size-8 shrink-0 items-center justify-center">
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
      <Container size="narrow">
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
