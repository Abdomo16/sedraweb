/** Mirrors the Prisma models so Phase 4 can swap mock data for the database. */
export type AgeBand = "BABY" | "KIDS" | "OLDER";
export type Gender = "GIRLS" | "BOYS" | "UNISEX";
export type Tone = "mint" | "sun" | "sky" | "sand" | "rose";

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  legacyName: string;
  ageBand: AgeBand;
  gender: Gender;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  tone: Tone;
}

export interface Variant {
  sku: string;
  size: string;
  color?: string;
  /** Piastres (EGP x 100). */
  price: number;
  compareAtPrice?: number;
  stock: number;
}

export interface Product {
  slug: string;
  name: string;
  description: string;
  material: string;
  categorySlug: string;
  tone: Tone;
  isNew?: boolean;
  variants: Variant[];
}
