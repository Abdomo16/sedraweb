"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { GOVERNORATES } from "@/config/governorates";
import { db } from "@/lib/db";
import { normalizeDigits } from "../catalog/utils";
import { requireAdmin } from "../auth/guard";

export type ShippingFormState = { message?: string; errors?: Record<string, string> };

/** EGP text ("65", "٦٥", "62.5") to piastres; 0 is allowed (free for that governorate). */
function parsePrice(input: string): number | null {
  const n = Number(normalizeDigits(input).trim());
  if (!Number.isFinite(n) || n < 0 || n > 10_000) return null;
  return Math.round(n * 100);
}

export async function saveShipping(
  _prev: ShippingFormState,
  formData: FormData,
): Promise<ShippingFormState> {
  await requireAdmin();

  const errors: Record<string, string> = {};
  const rates: { governorate: string; price: number }[] = [];
  for (const governorate of GOVERNORATES) {
    const raw = String(formData.get(`rate:${governorate}`) ?? "");
    const price = parsePrice(raw);
    if (price === null) errors[`rate:${governorate}`] = "اكتب سعر صحيح";
    else rates.push({ governorate, price });
  }

  const freeRaw = String(formData.get("freeOver") ?? "").trim();
  let freeOver: number | null = null;
  if (freeRaw) {
    freeOver = parsePrice(freeRaw);
    if (freeOver === null || freeOver === 0) errors.freeOver = "اكتب مبلغ صحيح أو سيبه فاضي";
  }

  if (Object.keys(errors).length) {
    return { errors, message: "راجع الأسعار الظاهرة بالأحمر." };
  }

  const confirmed = formData.get("confirmed") === "on";
  await db.$transaction([
    ...rates.map((r) =>
      db.shippingRate.upsert({
        where: { governorate: r.governorate },
        update: { price: r.price },
        create: r,
      }),
    ),
    db.setting.upsert({
      where: { key: "shipping.freeOver" },
      update: { value: freeOver ?? 0 },
      create: { key: "shipping.freeOver", value: freeOver ?? 0 },
    }),
    db.setting.upsert({
      where: { key: "shipping.confirmed" },
      update: { value: confirmed },
      create: { key: "shipping.confirmed", value: confirmed },
    }),
  ]);
  updateTag("shipping");
  redirect("/admin/shipping?saved=1");
}
