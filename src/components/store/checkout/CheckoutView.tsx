"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { formatEgp } from "@/components/ui/Price";
import { GOVERNORATES } from "@/config/governorates";
import { useCartData } from "@/features/cart/useCartData";
import { submitOrder, type CheckoutState } from "@/features/orders/actions";
import { normalizeEgyptPhone } from "@/features/orders/phone";
import { shippingFee, type ShippingInfo } from "@/features/shipping/pricing";

const field =
  "border-leaf-700/25 focus:border-leaf-700 focus:ring-leaf-500/30 mt-1 block min-h-12 w-full rounded-xl border bg-white px-4 text-base outline-none focus:ring-4 aria-[invalid=true]:border-red-500";

function checkoutKey(): string {
  const name = "sedra-checkout-key";
  try {
    const existing = window.sessionStorage.getItem(name);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(name, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

function Err({ children }: { children?: string }) {
  return children ? (
    <span role="alert" className="mt-1 block text-xs font-bold text-red-600">
      {children}
    </span>
  ) : null;
}

export function CheckoutView({ shipping, open }: { shipping: ShippingInfo; open: boolean }) {
  const { lines, data, loading } = useCartData(true);
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(submitOrder, {});
  const [governorate, setGovernorate] = useState("");
  const [phoneError, setPhoneError] = useState<string>();
  const e = state.errors ?? {};

  const qtyOf = (id: string) => lines.find((l) => l.variantId === id)?.qty ?? 0;
  const views = (data?.lines ?? []).filter((l) => qtyOf(l.variantId) > 0);
  const soldOut = views.some((l) => l.stock === 0);
  const subtotal = views
    .filter((l) => l.stock > 0)
    .reduce((n, l) => n + l.price * qtyOf(l.variantId), 0);
  const fee = governorate ? shippingFee(shipping, governorate, subtotal) : null;
  const total = subtotal + (fee ?? 0);

  if (!open) {
    return (
      <div className="shadow-soft rounded-3xl bg-white p-6 text-center">
        <p className="font-display text-leaf-900 text-xl font-extrabold">
          استقبال الطلبات مش متاح دلوقتي
        </p>
        <p className="text-ink/75 mt-2 text-sm">هنفتح قريب جداً. تابعنا.</p>
      </div>
    );
  }

  if (lines.length === 0 || (data && views.length === 0)) {
    return (
      <div className="shadow-soft rounded-3xl bg-white p-6 text-center">
        <p className="font-display text-leaf-900 text-xl font-extrabold">السلة فاضية</p>
        <p className="text-ink/75 mt-2 text-sm">ضيف منتجات الأول وبعدين كمّل الطلب.</p>
        <div className="mt-4 flex justify-center">
          <ButtonLink href="/collections">تسوّق دلوقتي</ButtonLink>
        </div>
      </div>
    );
  }

  const summary = (
    <ul className="grid gap-3">
      {views.map((l) => (
        <li key={l.variantId} className="flex items-center gap-3">
          <div className="bg-leaf-50 relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
            {l.image ? (
              <Image
                src={l.image.url}
                alt={l.image.alt}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-bold">{l.name}</p>
            <p className="text-ink/75 text-xs">
              مقاس {l.size} · {qtyOf(l.variantId).toLocaleString("ar-EG")} قطعة
            </p>
          </div>
          <p className="text-sm font-bold">{formatEgp(l.price * qtyOf(l.variantId))}</p>
        </li>
      ))}
    </ul>
  );

  const totals = (
    <dl className="mt-4 grid gap-2 text-sm">
      <div className="flex justify-between">
        <dt>المنتجات</dt>
        <dd className="font-bold">{formatEgp(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>الشحن</dt>
        <dd className="font-bold">
          {fee === null ? "اختار المحافظة" : fee === 0 ? "مجاني" : formatEgp(fee)}
        </dd>
      </div>
      <div className="border-leaf-700/10 flex justify-between border-t pt-2 text-base">
        <dt className="font-bold">الإجمالي</dt>
        <dd className="font-display text-leaf-900 text-xl font-extrabold">{formatEgp(total)}</dd>
      </div>
    </dl>
  );

  return (
    <form
      action={(fd) => {
        fd.set("idempotencyKey", checkoutKey());
        fd.set("items", JSON.stringify(lines));
        formAction(fd);
      }}
      className="grid gap-6 pb-28 md:grid-cols-[1fr_22rem] md:pb-0"
      noValidate
    >
      <div className="grid gap-6">
        <details className="shadow-soft rounded-2xl bg-white p-4 md:hidden">
          <summary className="flex cursor-pointer items-center justify-between text-sm font-bold">
            <span>ملخص الطلب ({views.length.toLocaleString("ar-EG")})</span>
            <span className="text-leaf-900">{formatEgp(total)}</span>
          </summary>
          <div className="mt-4">
            {summary}
            {totals}
          </div>
        </details>

        {state.message ? (
          <p
            role="alert"
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {state.message}
          </p>
        ) : null}
        {soldOut ? (
          <p
            role="alert"
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            فيه منتج خلص من المخزون.{" "}
            <Link href="/cart" className="underline">
              راجع السلة
            </Link>
          </p>
        ) : null}

        <section className="shadow-soft rounded-3xl bg-white p-4 md:p-6">
          <h2 className="font-display text-leaf-900 text-lg font-extrabold">بياناتك</h2>
          <div className="mt-4 grid gap-4">
            <label className="text-sm font-bold">
              الاسم بالكامل
              <input
                name="name"
                autoComplete="name"
                className={field}
                aria-invalid={Boolean(e.name)}
              />
              <Err>{e.name}</Err>
            </label>
            <label className="text-sm font-bold">
              رقم الموبايل
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="01012345678"
                className={field}
                aria-invalid={Boolean(e.phone || phoneError)}
                onBlur={(ev) =>
                  setPhoneError(
                    ev.target.value && !normalizeEgyptPhone(ev.target.value)
                      ? "رقم الموبايل غير صحيح. مثال: 01012345678"
                      : undefined,
                  )
                }
              />
              <Err>{e.phone ?? phoneError}</Err>
              <span className="text-ink/70 mt-1 block text-xs font-normal">
                هنتصل بيك على الرقم ده لتأكيد الطلب.
              </span>
            </label>
          </div>
        </section>

        <section className="shadow-soft rounded-3xl bg-white p-4 md:p-6">
          <h2 className="font-display text-leaf-900 text-lg font-extrabold">التوصيل</h2>
          <div className="mt-4 grid gap-4">
            <label className="text-sm font-bold">
              المحافظة
              <select
                name="governorate"
                value={governorate}
                onChange={(ev) => setGovernorate(ev.target.value)}
                className={field}
                aria-invalid={Boolean(e.governorate)}
              >
                <option value="">اختار المحافظة</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <Err>{e.governorate}</Err>
            </label>
            <label className="text-sm font-bold">
              المدينة أو المنطقة
              <input
                name="city"
                autoComplete="address-level2"
                className={field}
                aria-invalid={Boolean(e.city)}
              />
              <Err>{e.city}</Err>
            </label>
            <label className="text-sm font-bold">
              العنوان بالتفصيل
              <textarea
                name="address"
                rows={3}
                autoComplete="street-address"
                placeholder="اسم الشارع، رقم العمارة، الدور، الشقة"
                className={`${field} py-3`}
                aria-invalid={Boolean(e.address)}
              />
              <Err>{e.address}</Err>
            </label>
            <label className="text-sm font-bold">
              علامة مميزة (اختياري)
              <input name="landmark" placeholder="جنب مسجد، قدام صيدلية..." className={field} />
            </label>
            <label className="text-sm font-bold">
              ملاحظات على الطلب (اختياري)
              <textarea name="notes" rows={2} className={`${field} py-3`} />
            </label>
            {/* Honeypot: invisible to people, bots fill it and get rejected. */}
            <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
              <label>
                الموقع
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
          </div>
        </section>

        <section className="shadow-soft rounded-3xl bg-white p-4 md:p-6">
          <h2 className="font-display text-leaf-900 text-lg font-extrabold">الدفع</h2>
          <div className="border-leaf-700 bg-leaf-50 mt-4 rounded-2xl border-2 p-4">
            <p className="flex items-center gap-2 text-sm font-bold">
              <span className="border-leaf-700 flex size-5 items-center justify-center rounded-full border-2">
                <span className="bg-leaf-700 size-2.5 rounded-full" />
              </span>
              الدفع عند الاستلام
            </p>
            <p className="text-ink/80 mt-2 text-sm leading-7">
              بتدفع لما الأوردر يوصلك. وبعد ما تأكد الطلب هيتم التواصل مع حضرتك لتأكيده قبل الشحن.
            </p>
          </div>
        </section>
      </div>

      <aside className="hidden md:block">
        <div className="shadow-soft sticky top-24 rounded-3xl bg-white p-6">
          <h2 className="font-display text-leaf-900 mb-4 text-lg font-extrabold">ملخص الطلب</h2>
          {summary}
          {totals}
          <button
            type="submit"
            disabled={pending || loading || soldOut}
            className="bg-leaf-700 hover:bg-leaf-900 mt-5 min-h-12 w-full rounded-full px-6 text-base font-bold text-white transition-colors disabled:opacity-60"
          >
            {pending ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
          </button>
        </div>
      </aside>

      <div className="border-leaf-700/10 fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-ink/75 text-xs">الإجمالي</p>
            <p className="font-display text-leaf-900 text-lg font-extrabold">{formatEgp(total)}</p>
          </div>
          <button
            type="submit"
            disabled={pending || loading || soldOut}
            className="bg-leaf-700 hover:bg-leaf-900 min-h-12 flex-1 rounded-full px-6 text-base font-bold text-white transition-colors disabled:opacity-60"
          >
            {pending ? "جاري التأكيد..." : "تأكيد الطلب"}
          </button>
        </div>
      </div>
    </form>
  );
}
