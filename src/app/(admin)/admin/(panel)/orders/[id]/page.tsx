import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import {
  dangerBtn,
  inputCls,
  Notice,
  primaryBtn,
  Section,
  softBtn,
  StatusBadge,
} from "@/components/admin/ui";
import { formatEgp } from "@/components/ui/Price";
import { requireAdmin } from "@/features/admin/auth/guard";
import {
  addOrderNote,
  cancelOrder,
  confirmOrder,
  moveOrder,
  noAnswer,
  reopenOrder,
} from "@/features/admin/orders/actions";
import { orderNumber, statusLabel } from "@/features/orders/format";
import { formatPhone, whatsappLink } from "@/features/orders/phone";
import { db } from "@/lib/db";

const doneMessages: Record<string, string> = {
  confirmed: "تم تأكيد الطلب.",
  no_answer: "اتسجّلت محاولة الاتصال. الطلب لسه في قائمة التأكيد.",
  cancelled: "تم إلغاء الطلب ورجّعنا المخزون.",
  reopened: "اتفتح الطلب تاني.",
  shipped: "اتسجّل إن الطلب اتشحن.",
  delivered: "اتسجّل إن الطلب اتسلم.",
  returned: "اتسجّل إن الطلب رجع.",
  note: "اتضافت الملاحظة.",
};
const errorMessages: Record<string, string> = {
  state: "حالة الطلب اتغيّرت. حدّث الصفحة وجرّب تاني.",
  deposit: "الدفعة المقدمة لازم تكون رقم مش أكبر من إجمالي الطلب.",
  reason: "اكتب سبب الإلغاء.",
  stock: "مينفعش نعيد فتح الطلب لأن المخزون مش كفاية لواحد من المنتجات.",
  note: "اكتب الملاحظة الأول.",
};

const statusTone = {
  PENDING: "warn",
  CONFIRMED: "ok",
  SHIPPED: "ok",
  DELIVERED: "ok",
  CANCELLED: "muted",
  RETURNED: "danger",
} as const;

const eventLabel: Record<string, string> = {
  created: "طلب جديد",
  confirmed: "تأكيد",
  no_answer: "مفيش رد",
  cancelled: "إلغاء",
  reopened: "إعادة فتح",
  shipped: "شحن",
  delivered: "تسليم",
  returned: "مرتجع",
  note: "ملاحظة",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, events: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  const fmt = new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Cairo",
  });
  const done = typeof sp.done === "string" ? doneMessages[sp.done] : undefined;
  const error = typeof sp.error === "string" ? errorMessages[sp.error] : undefined;
  const number = orderNumber(order.number);
  const toCollect = order.total - order.depositAmount;
  const greeting = `أهلاً ${order.customerName}، معاك سيدرا كيدز بخصوص طلبك رقم ${number}.`;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-leaf-900 text-2xl font-extrabold">طلب #{number}</h1>
          <StatusBadge tone={statusTone[order.status]}>{statusLabel[order.status]}</StatusBadge>
        </div>
        <Link href="/admin/orders" className={softBtn}>
          رجوع للطلبات
        </Link>
      </div>
      <p className="text-ink/70 -mt-3 text-sm">
        اتعمل {fmt.format(order.createdAt)} · دفع عند الاستلام
      </p>

      {done ? <Notice>{done}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {order.status === "CANCELLED" && order.cancelReason ? (
        <Notice tone="warn">سبب الإلغاء: {order.cancelReason}</Notice>
      ) : null}

      <Section title="العميل">
        <div className="grid gap-1 text-sm">
          <p className="text-lg font-bold">{order.customerName}</p>
          <p dir="ltr" className="text-start text-base font-bold">
            {formatPhone(order.phone)}
          </p>
          <p className="mt-2 leading-7">
            {order.governorate}، {order.city}
            <br />
            {order.address}
            {order.landmark ? (
              <>
                <br />
                علامة مميزة: {order.landmark}
              </>
            ) : null}
          </p>
          {order.notes ? (
            <p className="bg-sun-100 mt-2 rounded-xl p-3 leading-7">ملاحظة العميل: {order.notes}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${order.phone}`} className={primaryBtn}>
            اتصال
          </a>
          <a
            href={whatsappLink(order.phone, greeting)}
            target="_blank"
            rel="noreferrer"
            className={softBtn}
          >
            واتساب
          </a>
        </div>
      </Section>

      <Section title="المنتجات">
        <ul className="divide-leaf-700/10 divide-y">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="block font-bold">{i.name}</span>
                <span className="text-ink/75 text-xs">
                  مقاس {i.size}
                  {i.color ? ` · ${i.color}` : ""} · {i.quantity.toLocaleString("ar-EG")} ×{" "}
                  {formatEgp(i.price)}
                </span>
              </span>
              <span className="font-bold">{formatEgp(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt>المنتجات</dt>
            <dd className="font-bold">{formatEgp(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>الشحن</dt>
            <dd className="font-bold">
              {order.shippingFee === 0 ? "مجاني" : formatEgp(order.shippingFee)}
            </dd>
          </div>
          <div className="border-leaf-700/10 flex justify-between border-t pt-2">
            <dt className="font-bold">الإجمالي</dt>
            <dd className="font-bold">{formatEgp(order.total)}</dd>
          </div>
          {order.depositAmount > 0 ? (
            <div className="flex justify-between">
              <dt>دفعة مقدمة اتاخدت</dt>
              <dd className="font-bold">{formatEgp(order.depositAmount)}</dd>
            </div>
          ) : null}
          <div className="bg-leaf-50 flex justify-between rounded-xl p-3 text-base">
            <dt className="font-bold">المطلوب تحصيله عند الاستلام</dt>
            <dd className="font-display text-leaf-900 text-xl font-extrabold">
              {formatEgp(toCollect)}
            </dd>
          </div>
        </dl>
      </Section>

      {order.status === "PENDING" ? (
        <Section
          title="تأكيد الطلب"
          description="كلّم العميل الأول. لو أكّد، سجّل التأكيد هنا (والدفعة المقدمة لو اتاخدت)."
        >
          <form action={confirmOrder.bind(null, order.id)} className="grid gap-3 md:max-w-md">
            <label className="text-sm font-bold">
              دفعة مقدمة اتاخدت (ج.م، اختياري)
              <input
                name="deposit"
                inputMode="decimal"
                dir="ltr"
                placeholder="مثال: 100"
                className={inputCls}
              />
            </label>
            <label className="text-sm font-bold">
              ملاحظة (اختياري)
              <input name="note" className={inputCls} />
            </label>
            <button className={primaryBtn}>أكدت الطلب</button>
          </form>
          <form action={noAnswer.bind(null, order.id)} className="grid gap-3 md:max-w-md">
            <label className="text-sm font-bold">
              مفيش رد؟ سجّل المحاولة (اختياري: ملاحظة)
              <input name="note" placeholder="اتصلت ومردش" className={inputCls} />
            </label>
            <button className={softBtn}>مفيش رد</button>
          </form>
        </Section>
      ) : null}

      {order.status === "CONFIRMED" ? (
        <Section title="الخطوة الجاية">
          <form action={moveOrder.bind(null, order.id, "shipped")}>
            <ConfirmButton message="تسجيل إن الطلب اتشحن؟" className={primaryBtn}>
              الطلب اتشحن
            </ConfirmButton>
          </form>
        </Section>
      ) : null}

      {order.status === "SHIPPED" ? (
        <Section title="الخطوة الجاية">
          <div className="flex flex-wrap gap-3">
            <form action={moveOrder.bind(null, order.id, "delivered")}>
              <ConfirmButton message="تسجيل إن الطلب اتسلم؟" className={primaryBtn}>
                الطلب اتسلم
              </ConfirmButton>
            </form>
            <form action={moveOrder.bind(null, order.id, "returned")}>
              <ConfirmButton message="تسجيل إن الطلب رجع؟" className={dangerBtn}>
                الطلب رجع
              </ConfirmButton>
            </form>
          </div>
        </Section>
      ) : null}

      {order.status === "DELIVERED" ? (
        <Section title="بعد التسليم">
          <form action={moveOrder.bind(null, order.id, "returned")}>
            <ConfirmButton
              message="تسجيل إن الطلب رجع؟ (المخزون مش بيرجع تلقائياً)"
              className={dangerBtn}
            >
              الطلب رجع
            </ConfirmButton>
          </form>
        </Section>
      ) : null}

      {order.status === "CANCELLED" ? (
        <Section
          title="إعادة فتح"
          description="لو العميل رجع وطلب، نقدر نفتح الطلب تاني طالما المخزون موجود."
        >
          <form action={reopenOrder.bind(null, order.id)}>
            <ConfirmButton message="إعادة فتح الطلب؟ هنحجز المخزون تاني." className={softBtn}>
              إعادة فتح الطلب
            </ConfirmButton>
          </form>
        </Section>
      ) : null}

      {order.status === "PENDING" || order.status === "CONFIRMED" ? (
        <Section
          title="إلغاء الطلب"
          description="الإلغاء بإيدك بس. السبب مطلوب والمخزون بيرجع للمخزن."
        >
          <form action={cancelOrder.bind(null, order.id)} className="grid gap-3 md:max-w-md">
            <label className="text-sm font-bold">
              سبب الإلغاء
              <input
                name="reason"
                placeholder="مثال: العميل مردش بعد 3 محاولات"
                className={inputCls}
              />
            </label>
            <ConfirmButton message="إلغاء الطلب نهائياً وإرجاع المخزون؟" className={dangerBtn}>
              إلغاء الطلب
            </ConfirmButton>
          </form>
        </Section>
      ) : null}

      <Section title="السجل">
        <form action={addOrderNote.bind(null, order.id)} className="flex gap-2">
          <input
            name="note"
            placeholder="أضف ملاحظة داخلية"
            aria-label="ملاحظة"
            className={`${inputCls} mt-0 flex-1`}
          />
          <button className={softBtn}>إضافة</button>
        </form>
        <ul className="grid gap-3">
          {order.events.map((e) => (
            <li key={e.id} className="border-leaf-700/15 border-s-2 ps-3 text-sm">
              <p className="font-bold">
                {eventLabel[e.type] ?? e.type}
                <span className="text-ink/60 ms-2 text-xs font-normal">
                  {fmt.format(e.createdAt)}
                  {e.adminName ? ` · ${e.adminName}` : ""}
                </span>
              </p>
              {e.message ? <p className="text-ink/85 mt-0.5 leading-7">{e.message}</p> : null}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
