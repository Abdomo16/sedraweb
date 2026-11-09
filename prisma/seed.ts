import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Categories = age band x gender, plus the "HE and SHE" line (11-16 years).
 * Public names are search-friendly Arabic; `legacyName` keeps the internal
 * names the company used before (بيبي / وسط / محير), for admin reference only.
 */
const categories = [
  {
    slug: "baby-girls",
    image: "/media/products/204/1.webp",
    name: "بيجامات بيبي بناتي من 6 شهور لسنتين",
    shortName: "بيبي بناتي",
    legacyName: "بيبي بناتي",
    ageBand: "BABY",
    gender: "GIRLS",
    ageLabel: "من 6 شهور لسنتين",
    description:
      "بيجامات وأطقم قطن ناعمة للرضع البنات من 6 شهور لسنتين، بخامة لطيفة على البشرة الحساسة وتصاميم مبهجة.",
    seoTitle: "بيجامات بيبي بناتي من 6 شهور لسنتين",
    seoDescription:
      "بيجامات وأطقم بيبي بناتي قطن ناعم من 6 شهور لسنتين. شحن لكل محافظات مصر والدفع عند الاستلام.",
  },
  {
    slug: "baby-boys",
    image: "/media/products/102/1.webp",
    name: "بيجامات بيبي ولادي من 6 شهور لسنتين",
    shortName: "بيبي ولادي",
    legacyName: "بيبي ولادي",
    ageBand: "BABY",
    gender: "BOYS",
    ageLabel: "من 6 شهور لسنتين",
    description:
      "بيجامات وأطقم قطن للرضع الأولاد من 6 شهور لسنتين، مريحة للنوم واللعب بخامات ناعمة وألوان هادية.",
    seoTitle: "بيجامات بيبي ولادي من 6 شهور لسنتين",
    seoDescription:
      "بيجامات وأطقم بيبي ولادي قطن ناعم بتصاميم لطيفة من 6 شهور لسنتين. شحن لكل المحافظات والدفع عند الاستلام.",
  },
  {
    slug: "girls",
    image: "/media/products/414/1.webp",
    name: "بيجامات أطفال بناتي من 3 لـ 8 سنين",
    shortName: "أطفال بناتي",
    legacyName: "وسط بناتي",
    ageBand: "KIDS",
    gender: "GIRLS",
    ageLabel: "من 3 لـ 8 سنين",
    description:
      "بيجامات وهوم وير بناتي بقطن مريح وطبعات مبهجة، للنوم وللبيت طول اليوم، لسن 3 لحد 8 سنين.",
    seoTitle: "بيجامات أطفال بناتي من 3 لـ 8 سنين",
    seoDescription:
      "بيجامات أطفال بناتي بطبعات مبهجة وقطن مريح لسن 3 لـ 8 سنين. اطلبي دلوقتي بالدفع عند الاستلام.",
  },
  {
    slug: "boys",
    image: "/media/products/309/1.webp",
    name: "بيجامات أطفال ولادي من 3 لـ 8 سنين",
    shortName: "أطفال ولادي",
    legacyName: "وسط ولادي",
    ageBand: "KIDS",
    gender: "BOYS",
    ageLabel: "من 3 لـ 8 سنين",
    description:
      "أطقم وبيجامات ولادي كاجوال وعملية بألوان عصرية، من قطن يستحمل اللعب والغسيل، لسن 3 لحد 8 سنين.",
    seoTitle: "بيجامات أطفال ولادي من 3 لـ 8 سنين",
    seoDescription:
      "بيجامات وأطقم أطفال ولادي كاجوال بقطن مريح لسن 3 لـ 8 سنين. شحن سريع والدفع عند الاستلام.",
  },
  {
    slug: "older-girls",
    image: "/media/products/601/1.webp",
    name: "بيجامات بناتي من 9 لـ 14 سنة",
    shortName: "كبار بناتي",
    legacyName: "محير بناتي",
    ageBand: "OLDER",
    gender: "GIRLS",
    ageLabel: "من 9 لـ 14 سنة",
    description:
      "بيجامات وهوم وير للبنات من 9 لـ 14 سنة بتصاميم أنيقة وخامات مريحة للبيت والنوم.",
    seoTitle: "بيجامات بناتي من 9 لـ 14 سنة",
    seoDescription:
      "بيجامات وهوم وير للبنات من 9 لـ 14 سنة بتصاميم أنيقة وقطن مريح. شحن لكل المحافظات والدفع عند الاستلام.",
  },
  {
    slug: "older-boys",
    image: "/media/products/506/1.webp",
    name: "بيجامات ولادي من 9 لـ 14 سنة",
    shortName: "كبار ولادي",
    legacyName: "محير ولادي",
    ageBand: "OLDER",
    gender: "BOYS",
    ageLabel: "من 9 لـ 14 سنة",
    description:
      "بيجامات وهوم وير للأولاد من 9 لـ 14 سنة بتصاميم عملية وخامات مريحة بتستحمل الاستخدام اليومي.",
    seoTitle: "بيجامات ولادي من 9 لـ 14 سنة",
    seoDescription:
      "بيجامات وهوم وير للأولاد من 9 لـ 14 سنة بتصاميم عملية وقطن مريح. شحن لكل المحافظات والدفع عند الاستلام.",
  },
  {
    slug: "he-and-she-girls",
    image: "/media/products/806/1.webp",
    name: "هوم وير بناتي من 11 لـ 16 سنة HE and SHE",
    shortName: "SHE بناتي",
    legacyName: "شي",
    ageBand: "TEEN",
    gender: "GIRLS",
    brand: "HE and SHE",
    ageLabel: "من 11 لـ 16 سنة",
    description:
      "هوم وير بناتي للمراهقات من 11 لـ 16 سنة من HE and SHE، بتصاميم عصرية وخامات مريحة للبيت والنوم.",
    seoTitle: "هوم وير بناتي من 11 لـ 16 سنة SHE",
    seoDescription:
      "هوم وير بناتي للمراهقات من 11 لـ 16 سنة من HE and SHE بتصاميم عصرية. شحن لكل المحافظات والدفع عند الاستلام.",
  },
  {
    slug: "he-and-she-boys",
    image: "/media/products/702/1.webp",
    name: "هوم وير ولادي من 11 لـ 16 سنة HE and SHE",
    shortName: "HE ولادي",
    legacyName: "هي",
    ageBand: "TEEN",
    gender: "BOYS",
    brand: "HE and SHE",
    ageLabel: "من 11 لـ 16 سنة",
    description:
      "هوم وير ولادي للمراهقين من 11 لـ 16 سنة من HE and SHE، بتصاميم عصرية وخامات مريحة للبيت والنوم.",
    seoTitle: "هوم وير ولادي من 11 لـ 16 سنة HE",
    seoDescription:
      "هوم وير ولادي للمراهقين من 11 لـ 16 سنة من HE and SHE بتصاميم عصرية. شحن لكل المحافظات والدفع عند الاستلام.",
  },
] as const;

async function main() {
  for (const [index, c] of categories.entries()) {
    const data = { ...c, sortOrder: index };
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: data,
      create: data,
    });
  }
  // The old catch-all "unisex" category no longer exists: drop it if it has no products.
  await prisma.category.deleteMany({ where: { slug: "unisex", products: { none: {} } } });
  console.log(`Seeded ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
