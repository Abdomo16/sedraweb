"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/features/admin/catalog/category-actions";
import { ImageUploader, type ImageItem } from "./ImageUploader";
import { SerpPreview } from "./SerpPreview";
import { Field, inputCls, Notice, primaryBtn, Section } from "./ui";

export type CategoryDefaults = {
  name: string;
  shortName: string;
  slug: string;
  description: string;
  ageLabel: string;
  ageBand: string;
  gender: string;
  brand: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: string;
  isActive: boolean;
  image: string | null;
};

export function CategoryForm({
  action,
  initial,
  isNew,
  productCount = 0,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial: CategoryDefaults;
  isNew: boolean;
  productCount?: number;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const e = state.errors ?? {};
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [description, setDescription] = useState(initial.description);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [images, setImages] = useState<ImageItem[]>(
    initial.image ? [{ url: initial.image, alt: initial.name }] : [],
  );

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.message ? <Notice tone="error">{state.message}</Notice> : null}

      <Section title="بيانات القسم">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="اسم القسم (يظهر في الصفحة وجوجل)" error={e.name}>
            <input
              name="name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="مثال: إسدالات صلاة للأطفال"
              className={inputCls}
              aria-invalid={Boolean(e.name)}
            />
          </Field>
          <Field label="الاسم المختصر (في القائمة)" error={e.shortName}>
            <input
              name="shortName"
              defaultValue={initial.shortName}
              placeholder="مثال: إسدالات"
              className={inputCls}
              aria-invalid={Boolean(e.shortName)}
            />
          </Field>
          <Field
            label="رابط القسم (إنجليزي)"
            error={e.slug}
            hint={
              isNew
                ? "بيظهر في الرابط، مثلاً isdal-ramadan. اكتبه بحروف إنجليزية."
                : productCount > 0 || initial.isActive
                  ? "لو غيّرته، الرابط القديم بيتحوّل تلقائياً للجديد (301) عشان جوجل."
                  : undefined
            }
          >
            <input
              name="slug"
              value={slug}
              onChange={(ev) => setSlug(ev.target.value)}
              dir="ltr"
              className={inputCls}
              aria-invalid={Boolean(e.slug)}
            />
          </Field>
          <Field label="ترتيب الظهور (الأصغر الأول)" error={e.sortOrder}>
            <input
              name="sortOrder"
              inputMode="numeric"
              defaultValue={initial.sortOrder}
              dir="ltr"
              className={inputCls}
            />
          </Field>
        </div>
        <Field
          label="وصف القسم (بيظهر أعلى الصفحة)"
          error={e.description}
          hint="اكتب فقرة مفيدة من 80 حرف أو أكتر. ده بيساعد ترتيب القسم في جوجل."
        >
          <textarea
            name="description"
            rows={4}
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            className={`${inputCls} py-2`}
          />
        </Field>
        {description.trim().length > 0 && description.trim().length < 80 ? (
          <Notice tone="warn">
            الوصف قصير ({description.trim().length} حرف). الأفضل 80 حرف أو أكتر.
          </Notice>
        ) : null}
        <label className="flex items-center gap-3 text-sm font-bold">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={initial.isActive}
            className="accent-leaf-700 size-5"
          />
          القسم ظاهر في الموقع
        </label>
        {!isNew && productCount > 0 ? (
          <Notice tone="warn">
            إخفاء القسم بيخفي كمان {productCount.toLocaleString("ar-EG")} منتج جواه من الموقع.
          </Notice>
        ) : null}
      </Section>

      <Section
        title="السن والنوع"
        description="اختياري. القسم اللي مالوش سن (زي الإسدالات) سيبهم فاضيين."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="الفئة العمرية">
            <select name="ageBand" defaultValue={initial.ageBand} className={inputCls}>
              <option value="">بدون</option>
              <option value="BABY">بيبي</option>
              <option value="KIDS">أطفال</option>
              <option value="OLDER">كبار</option>
              <option value="TEEN">مراهقين</option>
            </select>
          </Field>
          <Field label="النوع">
            <select name="gender" defaultValue={initial.gender} className={inputCls}>
              <option value="">بدون</option>
              <option value="GIRLS">بنات</option>
              <option value="BOYS">ولاد</option>
              <option value="UNISEX">للجنسين</option>
            </select>
          </Field>
          <Field label="نص السن (مثلاً: من 3 لـ 8 سنين)">
            <input name="ageLabel" defaultValue={initial.ageLabel} className={inputCls} />
          </Field>
          <Field label="الماركة (لو مختلفة، مثلاً HE and SHE)">
            <input name="brand" defaultValue={initial.brand} dir="ltr" className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="صورة القسم" description="بتظهر في بطاقة القسم في الصفحة الرئيسية.">
        <ImageUploader
          value={images}
          onChange={setImages}
          hint={slug || "category"}
          defaultAlt={name || "قسم"}
          max={1}
        />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
      </Section>

      <Section
        title="ظهور القسم في جوجل (SEO)"
        description="لو سيبتهم فاضيين، بنستخدم الاسم والوصف."
      >
        <Field label="عنوان جوجل" hint="الأفضل أقل من 60 حرف (اسم الموقع بيتضاف تلقائياً).">
          <input
            name="seoTitle"
            value={seoTitle}
            onChange={(ev) => setSeoTitle(ev.target.value)}
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
          title={seoTitle || name || "اسم القسم"}
          description={seoDescription || description}
          path={`/collections/${slug || "..."}`}
        />
      </Section>

      <div className="sticky bottom-16 z-20 flex gap-3 bg-gradient-to-t from-[#fcf9ef] pt-3 pb-2 md:bottom-0">
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? "جاري الحفظ..." : isNew ? "إضافة القسم" : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}
