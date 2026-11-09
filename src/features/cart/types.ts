/** Shape returned by /api/storefront/cart (prices in piastres). */
export type CartLineView = {
  variantId: string;
  qty: number;
  stock: number;
  price: number;
  compareAt?: number;
  name: string;
  size: string;
  color?: string;
  image?: { url: string; alt: string };
  slug: string;
};

export type MiniProduct = {
  slug: string;
  name: string;
  price: number;
  compareAt?: number;
  image?: { url: string; alt: string };
  inStock: boolean;
};

export type StorefrontCart = {
  lines: CartLineView[];
  /** Variant ids that are no longer sold. */
  missing: string[];
  suggestions: MiniProduct[];
  recent: MiniProduct[];
  freeOver: number | null;
};
