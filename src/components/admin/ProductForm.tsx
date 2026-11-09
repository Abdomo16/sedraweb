"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/features/admin/catalog/category-actions";
import { ImageUploader, type ImageItem } from "./ImageUploader";
import { SerpPreview } from "./SerpPreview";
import { Field, inputCls, Notice, primaryBtn, Section, softBtn } from "./ui";

export type VariantRow = {
  id?: string;
  sku: string;
  size: string;
  color: string;
  price: string;
  compareAt: string;
  stock: string;
};

export type ProductDefaults = {
  name: string;
  slug: string;
  code: string;
  categoryId: string;
  description: string;
  material: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isNew: boolean;
  seoTitle: string;
  seoDescription: string;
  variants: VariantRow[];
  images: ImageItem[];
};

type CategoryOption = { id: string; slug: string; name: string; shortName: string };

const emptyVariant = (): VariantRow => ({
  sku: "",
  size: "",
  color: "",
  price: "",
  compareAt: "",
  stock: "10",
});

const small =
  "border-leaf-700/25 focus:border-leaf-700 min-h-10 w-full rounded-lg border bg-white px-2 text-sm outline-none aria-[invalid=true]:border-red-500";

export function ProductForm({
  action,
  initial,
  categories,
  isNew,
  needsReview = false,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial: ProductDefaults;
  categories: CategoryOption[];
  isNew: boolean;
  needsReview?: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const e = state.errors ?? {};

  const [name, setName] = useState(initial.name);
  const [code, setCode] = useState(initial.code);
  const [categoryId, setCategoryId] = useState(initial.categoryId || categories[0]?.id || "");
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [description, setDescription] = useState(initial.description);
  const [status, setStatus] = useState(initial.status);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [variants, setVariants] = useState<VariantRow[]>(
    initial.variants.length ? initial.variants : [emptyVariant()],
  );
  const [images, setImages] = useState<ImageItem[]>(initial.images);

  const category = categories.find((c) => c.id === categoryId);
  const suggested = code.trim() && category ? `${category.slug}-${code.trim()}`.toLowerCase() : "";
  const shownSlug = slugTouched ? slug : suggested || slug;

  const setVariant = (i: number, patch: Partial<VariantRow>) =>
    setVariants((rows) => rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.message ? <Notice tone="error">{state.message}</Notice> : null}
      {needsReview ? (
        <Notice tone="warn">
          المنتج ده مستورد بسعر ومقاسات ومخزون تجريبية. راجعهم وعدّلهم، وبعدين أكّد المراجعة عشان
          تقدر تنشره.
        </Notice>
      ) : null}

      <Section title="بيانات المنتج">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="اسم المنتج" error={e.name} className="md:col-span-2">
            <input
              name="name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="مثال: بيجامة قطن بناتي بطبعة الورد"
              className={inputCls}
              aria-invalid={Boolean(e.name)}
            />
          </Field>
          <Field label="القسم" error={e.categoryId}>
            <select
              name="categoryId"
              value={categoryId}
              onChange={(ev) => setCategoryId(ev.target.value)}
              className={inputCls}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="كود المنتج (اختياري)" error={e.code}>
            <input
              name="code"
              value={code}
              onChange={(ev) => setCode(ev.target.value)}
              dir="ltr"
              className={inputCls}
              aria-invalid={Boolean(e.code)}
            />
          </Field>
          <Field
            label="رابط المنتج (إنجليزي)"
            error={e.slug}
            hint={
              isNew
                ? "بيتكتب تلقائياً من القسم والكود، وتقدر تعدّله. بعد النشر لو غيّرته الرابط القديم بيتحوّل للجديد."
                : "لو غيّرته، الرابط القديم بيتحوّل تلقائياً للجديد (301)."
            }
            className="md:col-span-2"
          >
            <input
              name="slug"
              value={shownSlug}
              onChange={(ev) => {
                setSlug(ev.target.value);
                setSlugTouched(true);
              }}
              dir="ltr"
              className={inputCls}
              aria-invalid={Boolean(e.slug)}
            />
          </Field>
          <Field label="الوصف" error={e.description} className="md:col-span-2">
            <textarea
              name="description"
              rows={5}
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              className={`${inputCls} py-2`}
              aria-invalid={Boolean(e.description)}
            />
          </Field>
          <Field label="الخامة (اختياري)" error={e.material} className="md:col-span-2">
            <input
              name="material"
              defaultValue={initial.material}
              placeholder="مثال: قطن 100%"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="المقاسات والسعر والمخزون"
        description="كل مقاس ليه سعره ومخزونه. الأسعار بالجنيه."
      >
        {e.variants ? <Notice tone="error">{e.variants}</Notice> : null}
        <div className="grid gap-3">
          {variants.map((v, i) => (
            <div
              key={v.id ?? `new-${i}`}
              className="bg-leaf-50 grid gap-2 rounded-2xl p-3 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] md:items-start"
            >
              <label className="text-xs font-bold">
                المقاس
                <input
                  value={v.size}
                  onChange={(ev) => setVariant(i, { size: ev.target.value })}
                  placeholder="مثال: 6-12 شهر"
                  className={small}
                  aria-invalid={Boolean(e[`variants.${i}.size`])}
                />
                <span className="text-xs text-red-600">{e[`variants.${i}.size`]}</span>
              </label>
              <label className="text-xs font-bold">
                اللون (اختياري)
                <input
                  value={v.color}
                  onChange={(ev) => setVariant(i, { color: ev.target.value })}
                  className={small}
                />
              </label>
              <label className="text-xs font-bold">
                السعر (ج.م)
                <input
                  value={v.price}
                  onChange={(ev) => setVariant(i, { price: ev.target.value })}
                  inputMode="decimal"
                  dir="ltr"
                  className={small}
                  aria-invalid={Boolean(e[`variants.${i}.price`])}
                />
                <span className="text-xs text-red-600">{e[`variants.${i}.price`]}</span>
              </label>
              <label className="text-xs font-bold">
                قبل الخصم (اختياري)
                <input
                  value={v.compareAt}
                  onChange={(ev) => setVariant(i, { compareAt: ev.target.value })}
                  inputMode="decimal"
                  dir="ltr"
                  className={small}
                  aria-invalid={Boolean(e[`variants.${i}.compareAt`])}
                />
                <span className="text-xs text-red-600">{e[`variants.${i}.compareAt`]}</span>
              </label>
              <label className="text-xs font-bold">
                المخزون
                <input
                  value={v.stock}
                  onChange={(ev) => setVariant(i, { stock: ev.target.value })}
                  inputMode="numeric"
                  dir="ltr"
                  className={small}
                  aria-invalid={Boolean(e[`variants.${i}.stock`])}
                />
                <span className="text-xs text-red-600">{e[`variants.${i}.stock`]}</span>
              </label>
              <button
                type="button"
                onClick={() => setVariants((rows) => rows.filter((_, k) => k !== i))}
                disabled={variants.length === 1}
                className="mt-5 min-h-10 rounded-lg bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-40"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={softBtn}
            onClick={() => setVariants((r) => [...r, emptyVariant()])}
          >
            + إضافة مقاس
          </button>
          <button
            type="button"
            className={softBtn}
            onClick={() => setVariants((rows) => rows.map((r) => ({ ...r, stock: "0" })))}
          >
            نفد كل المقاسات
          </button>
        </div>
        <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      </Section>

      <Section
        title="الصور"
        description="الصور بتظهر في الموقع وعند مشاركة اللينك. وصف الصورة مهم لجوجل."
      >
        {e.images ? <Notice tone="error">{e.images}</Notice> : null}
        <ImageUploader
          value={images}
          onChange={setImages}
          hint={shownSlug || "product"}
          defaultAlt={name || "منتج"}
        />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
      </Section>

      <Section
        title="ظهور المنتج في جوجل (SEO)"
        description="لو سيبتهم فاضيين، بنكتب عنوان ووصف تلقائي."
      >
        <Field label="عنوان جوجل" hint="الأفضل أقل من 60 حرف (اسم الموقع بيتضاف تلقائياً).">
          <input
            name="seoTitle"
            value={seoTitle}
            onChange={(ev) => setSeoTitle(ev.target.value)}
            placeholder={name ? `${name} | ${category?.shortName ?? ""}` : ""}
            className={inputCls}
          />
        </Field>
        <Field label="وصف جوجل" hint="من 70 لـ 160 حرف.">
          <textarea
            name="seoDescription"
            rows={3}
            value={seoDescription}
            onChange={(ev) => setSeoDescription(ev.target.value)}
            className={`${inputCls} py-2`}
          />
        </Field>
        <SerpPreview
          title={seoTitle || (name ? `${name} | ${category?.shortName ?? ""}` : "اسم المنتج")}
          description={seoDescription || description}
          path={`/products/${shownSlug || "..."}`}
        />
      </Section>

      <Section title="النشر">
        <Field label="الحالة">
          <select
            name="status"
            value={status}
            onChange={(ev) => setStatus(ev.target.value as ProductDefaults["status"])}
            className={inputCls}
          >
            <option value="DRAFT">مسودة (مش ظاهر في الموقع)</option>
            <option value="ACTIVE">منشور (ظاهر في الموقع)</option>
            <option value="ARCHIVED">مؤرشف (مخفي)</option>
          </select>
        </Field>
        <label className="flex items-center gap-3 text-sm font-bold">
          <input
            type="checkbox"
            name="isNew"
            defaultChecked={initial.isNew}
            className="accent-leaf-700 size-5"
          />
          يظهر في قسم &quot;وصل حديثاً&quot;
        </label>
        {needsReview ? (
          <div>
            <label className="flex items-center gap-3 text-sm font-bold">
              <input type="checkbox" name="confirmed" className="accent-leaf-700 size-5" />
              راجعت السعر والمقاسات والمخزون وهي صحيحة
            </label>
            {e.confirmed ? (
              <p role="alert" className="mt-1 text-xs font-bold text-red-600">
                {e.confirmed}
              </p>
            ) : null}
          </div>
        ) : null}
        {status === "ACTIVE" ? (
          <Notice tone="warn">المنتج هيظهر في الموقع وفي نتائج جوجل بمجرد الحفظ.</Notice>
        ) : null}
      </Section>

      <div className="sticky bottom-16 z-20 flex gap-3 bg-gradient-to-t from-[#fcf9ef] pt-3 pb-2 md:bottom-0">
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? "جاري الحفظ..." : isNew ? "إضافة المنتج" : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}
