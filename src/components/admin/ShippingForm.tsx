"use client";

import { useActionState } from "react";
import { saveShipping, type ShippingFormState } from "@/features/admin/shipping/actions";
import { Field, inputCls, Notice, primaryBtn, Section } from "./ui";

export function ShippingForm({
  rates,
  freeOver,
  confirmed,
}: {
  rates: { governorate: string; price: string }[];
  freeOver: string;
  confirmed: boolean;
}) {
  const [state, formAction, pending] = useActionState<ShippingFormState, FormData>(
    saveShipping,
    {},
  );
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.message ? <Notice tone="error">{state.message}</Notice> : null}

      <Section
        title="الشحن المجاني"
        description="لو إجمالي المنتجات وصل للمبلغ ده الشحن بيبقى مجاني. سيبه فاضي لو مفيش شحن مجاني."
      >
        <Field label="مجاني فوق (ج.م)" error={e.freeOver} className="max-w-xs">
          <input
            name="freeOver"
            defaultValue={freeOver}
            inputMode="decimal"
            dir="ltr"
            placeholder="مثال: 1000"
            className={inputCls}
            aria-invalid={Boolean(e.freeOver)}
          />
        </Field>
      </Section>

      <Section
        title="سعر الشحن لكل محافظة"
        description="بالجنيه. اكتب 0 لو الشحن مجاني لمحافظة معينة."
      >
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {rates.map((r) => (
            <Field key={r.governorate} label={r.governorate} error={e[`rate:${r.governorate}`]}>
              <input
                name={`rate:${r.governorate}`}
                defaultValue={r.price}
                inputMode="decimal"
                dir="ltr"
                className={inputCls}
                aria-invalid={Boolean(e[`rate:${r.governorate}`])}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="الاعتماد">
        <label className="flex items-start gap-3 text-sm font-bold">
          <input
            type="checkbox"
            name="confirmed"
            defaultChecked={confirmed}
            className="accent-leaf-700 mt-0.5 size-5"
          />
          <span>
            راجعت الأسعار دي وهي نهائية
            <span className="text-ink/70 mt-1 block text-xs font-normal">
              الموقع الحقيقي مش بيستقبل طلبات إلا بعد ما تعتمد الأسعار. الأسعار الحالية تجريبية لحد
              ما تتفقوا مع شركة الشحن.
            </span>
          </span>
        </label>
      </Section>

      <div className="sticky bottom-16 z-20 flex gap-3 bg-gradient-to-t from-[#fcf9ef] pt-3 pb-2 md:bottom-0">
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? "جاري الحفظ..." : "حفظ الأسعار"}
        </button>
      </div>
    </form>
  );
}
