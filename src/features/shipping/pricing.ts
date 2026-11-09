/** Pure shipping maths, safe to import from client components. */
export type ShippingInfo = {
  /** Price per governorate in piastres. */
  rates: Record<string, number>;
  /** Free shipping from this subtotal (piastres), or null when there is no free shipping. */
  freeOver: number | null;
  /** The owner confirmed the real prices (they are placeholders until then). */
  confirmed: boolean;
};

/** Shipping fee in piastres for a governorate and a subtotal, or null if the governorate is unknown. */
export function shippingFee(
  info: ShippingInfo,
  governorate: string,
  subtotal: number,
): number | null {
  const price = info.rates[governorate];
  if (price === undefined) return null;
  if (info.freeOver !== null && subtotal >= info.freeOver) return 0;
  return price;
}
