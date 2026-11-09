"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkoutSchema, OrderError, placeOrder } from "./place-order";

export type CheckoutState = { message?: string; errors?: Record<string, string> };

export async function submitOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const text = (k: string) => String(formData.get(k) ?? "");
  let items: unknown = [];
  try {
    items = JSON.parse(text("items") || "[]");
  } catch {
    items = [];
  }

  const parsed = checkoutSchema.safeParse({
    name: text("name"),
    phone: text("phone"),
    governorate: text("governorate"),
    city: text("city"),
    address: text("address"),
    landmark: text("landmark"),
    notes: text("notes"),
    items,
    idempotencyKey: text("idempotencyKey"),
    website: text("website"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { errors, message: errors.items ?? "راجع البيانات الظاهرة بالأحمر." };
  }

  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  let token: string;
  try {
    ({ token } = await placeOrder(parsed.data, ip));
  } catch (e) {
    if (e instanceof OrderError) {
      return { message: e.message, errors: e.field ? { [e.field]: e.message } : undefined };
    }
    console.error("placeOrder failed", e);
    return { message: "حصلت مشكلة وإحنا بنسجل الطلب. جرّب تاني أو كلمنا." };
  }
  redirect(`/order/${token}`);
}
