/** Single source of truth for brand + SEO defaults. */
export const siteConfig = {
  name: "سيدرا كيدز",
  nameEn: "Sedra Kids",
  /** Spelling variants people search with; used in copy, never keyword-stuffed. */
  nameVariants: ["سيدرا كيدز", "سيدر كيدز", "Sedra Kids", "Cedar Kids"],
  tagline: "بيجامات وملابس منزلية للأطفال",
  description:
    "سيدرا كيدز: بيجامات وملابس منزلية مريحة للأطفال من الرضع حتى الكبار، قطن ناعم وتصاميم مبهجة. شحن لكل محافظات مصر والدفع عند الاستلام.",
  locale: "ar_EG",
  lang: "ar",
  currency: "EGP",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  themeColor: "#3f7a22",
} as const;

export type SiteConfig = typeof siteConfig;
