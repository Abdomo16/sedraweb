/** Domain types used by the storefront; mapped from the Prisma models in `queries.ts`. */
export type AgeBand = "BABY" | "KIDS" | "OLDER" | "TEEN";
export type Gender = "GIRLS" | "BOYS" | "UNISEX";
export type Tone = "mint" | "sun" | "sky" | "sand" | "rose";
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  legacyName?: string;
  ageBand: AgeBand;
  gender: Gender;
  ageLabel?: string;
  /** Cover photo for the collection card. */
  image?: string;
  /** Set when the category belongs to a secondary brand line, e.g. "HE and SHE". */
  brand?: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  tone: Tone;
  updatedAt?: string;
}

export interface Variant {
  id: string;
  sku: string;
  size: string;
  color?: string;
  /** Piastres (EGP x 100). */
  price: number;
  compareAtPrice?: number;
  stock: number;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  slug: string;
  name: string;
  code?: string;
  description: string;
  material?: string;
  categorySlug: string;
  tone: Tone;
  status: ProductStatus;
  needsReview: boolean;
  isNew?: boolean;
  updatedAt?: string;
  images: ProductImage[];
  variants: Variant[];
}
