import { z } from "zod";
import { emptyToNull, normalizeDigits, parseEgp, parseInteger, SLUG_RE } from "./utils";

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "الرابط قصير جداً")
  .max(60, "الرابط طويل جداً")
  .regex(SLUG_RE, "الرابط بحروف إنجليزية صغيرة وأرقام وشرطات بس، مثلاً: isdal-ramadan");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `الحد الأقصى ${max} حرف`)
    .transform(emptyToNull)
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const imageSchema = z.object({
  url: z.string().regex(/^\/media\/[A-Za-z0-9_./-]+$/, "رابط صورة غير صالح"),
  alt: z.string().trim().min(1, "اكتب وصف للصورة").max(200),
});

export const categorySchema = z.object({
  name: z.string().trim().min(3, "الاسم قصير جداً").max(120),
  shortName: z.string().trim().min(2, "الاسم المختصر مطلوب").max(40),
  slug,
  description: optionalText(2000),
  ageLabel: optionalText(60),
  ageBand: z.enum(["BABY", "KIDS", "OLDER", "TEEN", ""]).transform((v) => v || null),
  gender: z.enum(["GIRLS", "BOYS", "UNISEX", ""]).transform((v) => v || null),
  brand: optionalText(60),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
  sortOrder: z
    .string()
    .transform((v) => parseInteger(v) ?? 0)
    .pipe(z.number().int().min(0).max(9999)),
  isActive: z.boolean(),
  images: z.array(imageSchema).max(1),
});
export type CategoryInput = z.infer<typeof categorySchema>;

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().max(60).optional().default(""),
  size: z.string().trim().min(1, "المقاس مطلوب").max(40),
  color: optionalText(40),
  price: z
    .string()
    .transform((v) => parseEgp(v))
    .refine((v): v is number => v !== null, "اكتب سعر صحيح"),
  compareAt: z.string().transform((v) => (v.trim() ? parseEgp(v) : undefined)),
  stock: z
    .string()
    .transform((v) => parseInteger(v.trim() || "0"))
    .refine((v): v is number => v !== null && v >= 0 && v <= 100000, "المخزون رقم من 0 لـ 100000"),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(3, "الاسم قصير جداً").max(160),
    slug,
    code: optionalText(30),
    categoryId: z.string().min(1, "اختار القسم"),
    description: z.string().trim().min(10, "اكتب وصف للمنتج (10 حروف على الأقل)").max(5000),
    material: optionalText(200),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    isNew: z.boolean(),
    confirmed: z.boolean(),
    seoTitle: optionalText(70),
    seoDescription: optionalText(170),
    variants: z.array(variantSchema).min(1, "ضيف مقاس واحد على الأقل").max(30),
    images: z.array(imageSchema).max(10),
  })
  .superRefine((v, ctx) => {
    v.variants.forEach((variant, i) => {
      if (
        variant.compareAt !== undefined &&
        variant.compareAt !== null &&
        variant.compareAt <= variant.price
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["variants", i, "compareAt"],
          message: "السعر قبل الخصم لازم يكون أكبر من السعر",
        });
      }
    });
    const sizes = v.variants.map((x) => `${x.size}|${x.color ?? ""}`.toLowerCase());
    if (new Set(sizes).size !== sizes.length) {
      ctx.addIssue({ code: "custom", path: ["variants"], message: "فيه مقاس مكرر" });
    }
  });
export type ProductInput = z.infer<typeof productSchema>;

/** Flatten zod issues into { "variants.0.price": "message" } for the forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export { normalizeDigits };
