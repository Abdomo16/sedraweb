import type { Category, Product, Tone, Variant } from "./types";

export const categories: Category[] = [
  {
    slug: "baby-girls",
    name: "بيجامات بيبي رضع بناتي",
    shortName: "بيبي بناتي",
    legacyName: "بيبي بناتي",
    ageBand: "BABY",
    gender: "GIRLS",
    tone: "sun",
    intro:
      "بيجامات وأفرولات قطن ناعم للرضع البنات، بخامة لطيفة على البشرة الحساسة وأزرار سهلة لتغيير الحفاضة.",
    seoTitle: "بيجامات بيبي رضع بناتي قطن | سيدرا كيدز",
    seoDescription:
      "بيجامات وأفرولات بيبي رضع بناتي قطن ناعم، مقاسات من حديثي الولادة. شحن لكل محافظات مصر والدفع عند الاستلام.",
  },
  {
    slug: "baby-boys",
    name: "بيجامات بيبي رضع ولادي",
    shortName: "بيبي ولادي",
    legacyName: "بيبي ولادي",
    ageBand: "BABY",
    gender: "BOYS",
    tone: "sky",
    intro: "بيجامات وأفرولات قطن للرضع الأولاد، مريحة للنوم واللعب بخامات ناعمة وألوان هادية.",
    seoTitle: "بيجامات بيبي رضع ولادي قطن | سيدرا كيدز",
    seoDescription:
      "بيجامات وأفرولات بيبي رضع ولادي قطن ناعم بتصاميم لطيفة. شحن لكل المحافظات والدفع عند الاستلام.",
  },
  {
    slug: "girls",
    name: "بيجامات أطفال بناتي",
    shortName: "أطفال بناتي",
    legacyName: "وسط بناتي",
    ageBand: "KIDS",
    gender: "GIRLS",
    tone: "rose",
    intro: "بيجامات بناتي بقطن مريح وطبعات مبهجة، للنوم وللبيت طول اليوم، بمقاسات من 3 لـ 8.",
    seoTitle: "بيجامات أطفال بناتي قطن | سيدرا كيدز",
    seoDescription:
      "بيجامات أطفال بناتي بطبعات مبهجة وقطن مريح، مقاسات من 3 لـ 8. اطلبي دلوقتي بالدفع عند الاستلام.",
  },
  {
    slug: "boys",
    name: "بيجامات أطفال ولادي",
    shortName: "أطفال ولادي",
    legacyName: "وسط ولادي",
    ageBand: "KIDS",
    gender: "BOYS",
    tone: "mint",
    intro:
      "أطقم وبيجامات ولادي كاجوال وعملية بألوان عصرية، من قطن يستحمل اللعب والغسيل، بمقاسات من 3 لـ 8.",
    seoTitle: "بيجامات أطفال ولادي قطن | سيدرا كيدز",
    seoDescription:
      "بيجامات وأطقم أطفال ولادي كاجوال بقطن مريح، مقاسات من 3 لـ 8. شحن سريع والدفع عند الاستلام.",
  },
  {
    slug: "older-girls",
    name: "بيجامات كبار الأطفال بناتي",
    shortName: "كبار بناتي",
    legacyName: "محير بناتي",
    ageBand: "OLDER",
    gender: "GIRLS",
    tone: "sun",
    intro: "بيجامات وهوم وير للبنات الكبار بتصاميم أنيقة وخامات مريحة للبيت والنوم.",
    seoTitle: "بيجامات كبار الأطفال بناتي | سيدرا كيدز",
    seoDescription:
      "بيجامات وهوم وير للبنات الكبار بتصاميم أنيقة وقطن مريح. شحن لكل المحافظات والدفع عند الاستلام.",
  },
  {
    slug: "older-boys",
    name: "بيجامات كبار الأطفال ولادي",
    shortName: "كبار ولادي",
    legacyName: "محير ولادي",
    ageBand: "OLDER",
    gender: "BOYS",
    tone: "sand",
    intro: "بيجامات وهوم وير للأولاد الكبار بتصاميم عملية وخامات مريحة بتستحمل الاستخدام اليومي.",
    seoTitle: "بيجامات كبار الأطفال ولادي | سيدرا كيدز",
    seoDescription:
      "بيجامات وهوم وير للأولاد الكبار بتصاميم عملية وقطن مريح. شحن لكل المحافظات والدفع عند الاستلام.",
  },
  {
    slug: "unisex",
    name: "بيجامات أطفال للجنسين",
    shortName: "للجنسين",
    legacyName: "محير He&She",
    ageBand: "OLDER",
    gender: "UNISEX",
    tone: "sky",
    intro: "بيجامات بتصاميم تناسب الولاد والبنات، بألوان هادية وخامات قطن مريحة.",
    seoTitle: "بيجامات أطفال للجنسين | سيدرا كيدز",
    seoDescription:
      "بيجامات أطفال للجنسين بألوان هادية وقطن مريح، تناسب الولاد والبنات. الدفع عند الاستلام وشحن لكل المحافظات.",
  },
];

const BABY_SIZES = ["3-6 شهور", "6-12 شهر", "12-18 شهر"];
const KIDS_SIZES = ["3", "4", "5", "6", "7", "8"];
const OLDER_SIZES = ["8", "10", "12", "14"];

function variants(prefix: string, sizes: string[], price: number, compare?: number): Variant[] {
  return sizes.map((size, i) => ({
    sku: `${prefix}-${i + 1}`,
    size,
    price: price * 100,
    compareAtPrice: compare ? compare * 100 : undefined,
    stock: i === sizes.length - 1 ? 0 : 12,
  }));
}

function p(
  slug: string,
  name: string,
  categorySlug: string,
  tone: Tone,
  sizes: string[],
  price: number,
  extra: Partial<Product> = {},
  compare?: number,
): Product {
  return {
    slug,
    name,
    categorySlug,
    tone,
    material: "قطن 100% ناعم وقابل للغسيل بالغسالة",
    description:
      "بيجامة مريحة للبيت والنوم، خامة ناعمة على البشرة وخياطة متينة بتتحمل الغسيل المتكرر. مقاسات واضحة وألوان ثابتة.",
    variants: variants(slug.slice(0, 6).toUpperCase(), sizes, price, compare),
    ...extra,
  };
}

export const products: Product[] = [
  p("baby-girl-stars-set", "طقم بيبي بناتي بطبعة النجوم", "baby-girls", "sun", BABY_SIZES, 375, {
    isNew: true,
  }),
  p(
    "baby-girl-bunny-romper",
    "أفرول بيبي بناتي الأرنب الصغير",
    "baby-girls",
    "rose",
    BABY_SIZES,
    399,
  ),
  p("baby-boy-bear-set", "طقم بيبي ولادي بطبعة الدب", "baby-boys", "sky", BABY_SIZES, 375, {
    isNew: true,
  }),
  p("baby-boy-moon-romper", "أفرول بيبي ولادي القمر", "baby-boys", "mint", BABY_SIZES, 399),
  p("girls-flower-pajama", "بيجامة بناتي بطبعة الورود", "girls", "rose", KIDS_SIZES, 435, {
    isNew: true,
  }),
  p("girls-strawberry-set", "طقم بناتي الفراولة الشتوي", "girls", "sun", KIDS_SIZES, 475, {}, 550),
  p("girls-cloud-pajama", "بيجامة بناتي السحابة", "girls", "sky", KIDS_SIZES, 435),
  p("boys-graphic-set", "طقم ولادي جرافيك عصري", "boys", "mint", KIDS_SIZES, 435, { isNew: true }),
  p("boys-cargo-set", "طقم ولادي كاجوال جيوب كارغو", "boys", "sand", KIDS_SIZES, 475),
  p("boys-tiedye-set", "طقم ولادي تاي داي", "boys", "sky", KIDS_SIZES, 435, {}, 520),
  p("older-girls-classic", "بيجامة كلاسيك للبنات الكبار", "older-girls", "sun", OLDER_SIZES, 575),
  p("unisex-stripe-set", "طقم ستريب للجنسين", "unisex", "mint", OLDER_SIZES, 575, { isNew: true }),
];
