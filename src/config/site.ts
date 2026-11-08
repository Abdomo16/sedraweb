/** Single source of truth for brand + SEO defaults. */
export const siteConfig = {
  name: "سيدر كيدز",
  nameEn: "Cedar Kids",
  /** Spelling variants people search with; used in copy, never keyword-stuffed. */
  nameVariants: ["سيدر كيدز", "سيدرا كيدز", "Cedar Kids", "Sedra Kids"],
  tagline: "بيجامات وملابس منزلية للأطفال",
  description:
    "سيدر كيدز: بيجامات وملابس منزلية مريحة للأطفال من الرضع حتى الكبار، قطن ناعم وتصاميم مبهجة. شحن لكل محافظات مصر والدفع عند الاستلام.",
  locale: "ar_EG",
  lang: "ar",
  currency: "EGP",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  themeColor: "#1f5b45",
} as const;

export type SiteConfig = typeof siteConfig;
