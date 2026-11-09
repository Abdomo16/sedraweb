import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import type { ShippingInfo } from "./pricing";

/** Fresh read, used inside Server Actions where the numbers must be exact. */
export async function loadShippingInfo(): Promise<ShippingInfo> {
  const [rows, settings] = await Promise.all([
    db.shippingRate.findMany(),
    db.setting.findMany({ where: { key: { in: ["shipping.freeOver", "shipping.confirmed"] } } }),
  ]);
  const setting = (key: string) => settings.find((s) => s.key === key)?.value;
  const freeOver = setting("shipping.freeOver");
  return {
    rates: Object.fromEntries(rows.map((r) => [r.governorate, r.price])),
    freeOver: typeof freeOver === "number" && freeOver > 0 ? freeOver : null,
    confirmed: setting("shipping.confirmed") === true,
  };
}

/** Cached read for pages. The admin refreshes it with updateTag("shipping"). */
export async function getShippingInfo(): Promise<ShippingInfo> {
  "use cache";
  cacheLife("hours");
  cacheTag("shipping");
  return loadShippingInfo();
}

/**
 * Checkout is always open in development. In production it opens only after the owner
 * confirms the real shipping prices (a guard against launching with placeholder prices).
 */
export function checkoutOpen(info: ShippingInfo): boolean {
  return env.NODE_ENV !== "production" || info.confirmed;
}

export { shippingFee } from "./pricing";
export type { ShippingInfo } from "./pricing";
