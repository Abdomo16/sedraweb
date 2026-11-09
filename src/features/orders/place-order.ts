import { z } from "zod";
import { GOVERNORATES } from "@/config/governorates";
import { visibleStatuses } from "@/features/catalog/visibility";
import { checkoutOpen, loadShippingInfo, shippingFee } from "@/features/shipping/rates";
import { db } from "@/lib/db";
import { allow } from "@/lib/rate-limit";
import { normalizeEgyptPhone } from "./phone";

/** A problem the customer can read and fix. */
export class OrderError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

const text = (min: number, max: number, minMsg: string) =>
  z.string().trim().min(min, minMsg).max(max, "النص طويل");

export const checkoutSchema = z.object({
  name: text(3, 80, "اكتب اسمك بالكامل"),
  phone: z.string().trim().min(1, "اكتب رقم الموبايل"),
  governorate: z
    .string()
    .refine((g) => (GOVERNORATES as readonly string[]).includes(g), "اختار المحافظة"),
  city: text(2, 60, "اكتب المدينة أو المنطقة"),
  address: text(6, 300, "اكتب العنوان بالتفصيل"),
  landmark: z.string().trim().max(120).default(""),
  notes: z.string().trim().max(500).default(""),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "السلة فاضية")
    .max(30),
  idempotencyKey: z.string().min(16).max(80),
  /** Honeypot: real people never see or fill this field. */
  website: z.string().max(0).default(""),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

const MAX_PENDING_PER_PHONE = 3;

/**
 * Creates a cash-on-delivery order. Prices, stock and shipping are always read from the
 * database; nothing the browser sends about money is trusted. Stock is reduced with a
 * conditional update inside the transaction, so two customers can never take the same
 * last piece. Returns the token for the confirmation link.
 */
export async function placeOrder(input: CheckoutInput, ip: string): Promise<{ token: string }> {
  if (input.website) throw new OrderError("تعذّر إتمام الطلب. جرّب تاني.");

  const phone = normalizeEgyptPhone(input.phone);
  if (!phone) throw new OrderError("رقم الموبايل غير صحيح. مثال: 01012345678", "phone");

  // Same checkout attempt submitted twice: return the order that already exists.
  const existing = await db.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    select: { publicToken: true },
  });
  if (existing) return { token: existing.publicToken };

  if (!allow(`order:ip:${ip}`, 6, 10 * 60 * 1000)) {
    throw new OrderError("طلبات كتير في وقت قصير. استنى دقايق وجرّب تاني.");
  }

  const shipping = await loadShippingInfo();
  if (!checkoutOpen(shipping)) throw new OrderError("استقبال الطلبات مش متاح دلوقتي.");

  const pending = await db.order.count({
    where: {
      phone,
      status: "PENDING",
      createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (pending >= MAX_PENDING_PER_PHONE) {
    throw new OrderError("عندك طلبات لسه بنراجعها. هنتواصل معاك قريب.");
  }

  // Same variant twice in the cart: merge the quantities.
  const lines = new Map<string, number>();
  for (const item of input.items)
    lines.set(item.variantId, (lines.get(item.variantId) ?? 0) + item.qty);

  const order = await db.$transaction(async (tx) => {
    const variants = await tx.variant.findMany({
      where: {
        id: { in: [...lines.keys()] },
        product: { status: { in: visibleStatuses() }, category: { isActive: true } },
      },
      include: { product: { select: { name: true } } },
    });
    if (variants.length !== lines.size) {
      throw new OrderError("فيه منتج في السلة لم يعد متاحاً. راجع السلة وجرّب تاني.");
    }

    let subtotal = 0;
    const items = [];
    for (const v of variants) {
      const qty = lines.get(v.id) as number;
      const reserved = await tx.variant.updateMany({
        where: { id: v.id, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (reserved.count !== 1) {
        const left = await tx.variant.findUnique({ where: { id: v.id }, select: { stock: true } });
        throw new OrderError(
          left && left.stock > 0
            ? `المتاح من ${v.product.name} (مقاس ${v.size}) ${left.stock} قطعة بس.`
            : `${v.product.name} (مقاس ${v.size}) خلص من المخزون.`,
        );
      }
      subtotal += v.price * qty;
      items.push({
        variantId: v.id,
        name: v.product.name,
        size: v.size,
        color: v.color,
        price: v.price,
        quantity: qty,
      });
    }

    const fee = shippingFee(shipping, input.governorate, subtotal);
    if (fee === null) throw new OrderError("اختار المحافظة", "governorate");

    return tx.order.create({
      data: {
        status: "PENDING",
        paymentMethod: "COD",
        paymentStatus: "UNPAID",
        subtotal,
        shippingFee: fee,
        total: subtotal + fee,
        customerName: input.name,
        phone,
        governorate: input.governorate,
        city: input.city,
        address: input.address,
        landmark: input.landmark || null,
        notes: input.notes || null,
        idempotencyKey: input.idempotencyKey,
        items: { create: items },
        events: { create: { type: "created", message: "طلب جديد من الموقع (دفع عند الاستلام)" } },
      },
      select: { publicToken: true },
    });
  });

  return { token: order.publicToken };
}
