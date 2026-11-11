import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";
import { siteConfig } from "@/config/site";
import { getCategories } from "@/features/catalog/queries";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "من نحن: ملابس منزلية وبيجامات أطفال",
  description:
    "تعرف على سيدرا كيدز: ملابس منزلية وبيجامات مريحة للأطفال من 6 شهور حتى 16 سنة، بنات وولاد، مع شحن لكل محافظات مصر والدفع عند الاستلام.",
  alternates: { canonical: "/about" },
};

const promises = [
  {
    title: "راحة لأطفالك",
    text: "نختار خامات وقصّات مريحة للبيت والنوم واللعب، عشان طفلك يتحرك براحته.",
  },
  {
    title: "من الرضّع للمراهقين",
    text: "مقاسات من 6 شهور لحد 16 سنة، للبنات والولاد، في أقسام مرتبة حسب السن.",
  },
  {
    title: "شحن لكل المحافظات",
    text: "بنوصّل لكل محافظات مصر، والدفع عند الاستلام متاح.",
  },
  {
    title: "مقاس واضح من غير تخمين",
    text: "كل منتج عليه المقاسات المتاحة، وبتعرف المتاح منها قبل ما تطلب.",
  },
];

export default async function AboutPage() {
  const categories = await getCategories();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "الرئيسية", path: "/" },
            { name: "من نحن", path: "/about" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: `من نحن | ${siteConfig.name}`,
            url: `${siteConfig.url}/about`,
            inLanguage: siteConfig.lang,
            about: { "@id": `${siteConfig.url}/#organization` },
          },
        ]}
      />
      <Container size="narrow" className="py-6">
        <nav aria-label="مسار التصفح" className="text-ink/75 mb-3 text-xs">
          <Link href="/">الرئيسية</Link> / من نحن
        </nav>
        <h1 className="font-display text-leaf-900 text-3xl leading-10 font-extrabold">
          من نحن: {siteConfig.name}
        </h1>
        <p className="text-ink/80 mt-3 text-base leading-8">
          {siteConfig.name} علامة مصرية للملابس المنزلية وبيجامات الأطفال. بنقدّم تصاميم مبهجة
          ومريحة للرضّع والأطفال والمراهقين، بنات وولاد، عشان وقت البيت والنوم يبقى أحلى.
        </p>

        <section aria-labelledby="promises" className="mt-8">
          <h2 id="promises" className="font-display text-leaf-900 mb-4 text-xl font-extrabold">
            وعدنا ليك
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {promises.map((p) => (
              <li key={p.title} className="rounded-card bg-leaf-50 p-4">
                <p className="text-leaf-900 font-bold">{p.title}</p>
                <p className="text-ink/80 mt-1 text-sm leading-7">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="shop" className="mt-8">
          <h2 id="shop" className="font-display text-leaf-900 mb-3 text-xl font-extrabold">
            تسوّق حسب السن
          </h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="bg-leaf-100 text-leaf-900 hover:bg-leaf-500 inline-block rounded-full px-4 py-2.5 text-sm font-bold transition-colors hover:text-white"
                >
                  {c.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8">
          <ButtonLink href="/collections">تصفح كل الأقسام</ButtonLink>
        </div>
      </Container>
    </>
  );
}
