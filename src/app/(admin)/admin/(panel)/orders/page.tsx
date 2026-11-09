import Link from "next/link";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { inputCls, softBtn, StatusBadge } from "@/components/admin/ui";
import { formatEgp } from "@/components/ui/Price";
import { requireAdmin } from "@/features/admin/auth/guard";
import { normalizeDigits } from "@/features/admin/catalog/utils";
import { orderNumber, statusLabel } from "@/features/orders/format";
import { formatPhone } from "@/features/orders/phone";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

const PAGE_SIZE = 20;

const tabs = [
  { id: "pending", label: "محتاج تأكيد" },
  { id: "confirmed", label: "مؤكدة" },
  { id: "online", label: "مدفوعة أونلاين" },
  { id: "shipped", label: "اتشحنت" },
  { id: "delivered", label: "اتسلمت" },
  { id: "cancelled", label: "ملغية" },
  { id: "returned", label: "مرتجعة" },
  { id: "all", label: "الكل" },
] as const;
type TabId = (typeof tabs)[number]["id"];

const tabWhere: Record<TabId, Prisma.OrderWhereInput> = {
  pending: { status: "PENDING" },
  confirmed: { status: "CONFIRMED" },
  online: { paymentStatus: "PAID" },
  shipped: { status: "SHIPPED" },
  delivered: { status: "DELIVERED" },
  cancelled: { status: "CANCELLED" },
  returned: { status: "RETURNED" },
  all: {},
};

const statusTone = {
  PENDING: "warn",
  CONFIRMED: "ok",
  SHIPPED: "ok",
  DELIVERED: "ok",
  CANCELLED: "muted",
  RETURNED: "danger",
} as const;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = (tabs.find((t) => t.id === one(sp.tab))?.id ?? "pending") as TabId;
  const q = one(sp.q).trim();
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const digits = normalizeDigits(q).replace(/\D/g, "");
  const search: Prisma.OrderWhereInput = q
    ? {
        OR: [
          { customerName: { contains: q, mode: "insensitive" } },
          ...(digits ? [{ phone: { contains: digits } }] : []),
          ...(digits.length >= 4 && Number(digits) > 1000
            ? [{ number: Number(digits) - 1000 }]
            : []),
        ],
      }
    : {};
  const where: Prisma.OrderWhereInput = { AND: [tabWhere[tab], search] };

  const [total, orders, grouped, online] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      // The "needs confirmation" tab is a to-do list: oldest first.
      orderBy: { createdAt: tab === "pending" ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { items: { select: { quantity: true } } },
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.count({ where: { paymentStatus: "PAID" } }),
  ]);

  const counts: Record<TabId, number> = {
    pending: 0,
    confirmed: 0,
    online,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    all: grouped.reduce((n, g) => n + g._count._all, 0),
  };
  for (const g of grouped) counts[g.status.toLowerCase() as TabId] = g._count._all;

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (t: string, p = 1) => {
    const params = new URLSearchParams({ tab: t });
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    return `/admin/orders?${params}`;
  };
  const fmt = new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Cairo",
  });

  return (
    <div>
      {tab === "pending" ? <AutoRefresh seconds={30} /> : null}
      <h1 className="font-display text-leaf-900 text-2xl font-extrabold">الطلبات</h1>

      <nav
        aria-label="حالات الطلبات"
        className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={link(t.id)}
            aria-current={t.id === tab ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors ${
              t.id === tab ? "bg-leaf-700 text-white" : "text-leaf-900 hover:bg-leaf-100 bg-white"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-2 text-xs ${
                t.id === tab
                  ? "bg-white/20"
                  : t.id === "pending" && counts.pending > 0
                    ? "bg-sun-400"
                    : "bg-leaf-100"
              }`}
            >
              {counts[t.id].toLocaleString("ar-EG")}
            </span>
          </Link>
        ))}
      </nav>

      <form action="/admin/orders" className="shadow-soft mt-4 flex gap-3 rounded-3xl bg-white p-3">
        <input type="hidden" name="tab" value={tab} />
        <input
          name="q"
          defaultValue={q}
          placeholder="ابحث بالاسم أو الموبايل أو رقم الطلب"
          className={`${inputCls} mt-0 flex-1`}
          aria-label="بحث"
        />
        <button className={softBtn}>بحث</button>
      </form>

      {tab === "pending" && orders.length > 0 ? (
        <p className="text-ink/75 mt-3 text-sm">الأقدم الأول. اتصل بالعميل وأكّد الطلب من صفحته.</p>
      ) : null}

      <ul className="mt-4 grid gap-3">
        {orders.map((o) => {
          const pieces = o.items.reduce((n, i) => n + i.quantity, 0);
          return (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="shadow-soft flex flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl bg-white p-4 transition-transform hover:-translate-y-0.5"
              >
                <span className="font-display text-leaf-900 text-lg font-extrabold">
                  #{orderNumber(o.number)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{o.customerName}</span>
                  <span className="text-ink/75 block text-xs">
                    <span dir="ltr">{formatPhone(o.phone)}</span> · {o.governorate} ·{" "}
                    {pieces.toLocaleString("ar-EG")} قطعة
                  </span>
                </span>
                <span className="text-end">
                  <span className="block font-bold">{formatEgp(o.total)}</span>
                  <span className="text-ink/70 block text-xs">{fmt.format(o.createdAt)}</span>
                </span>
                <span className="flex w-full flex-wrap items-center gap-1.5">
                  <StatusBadge tone={statusTone[o.status]}>{statusLabel[o.status]}</StatusBadge>
                  {o.depositAmount > 0 ? (
                    <StatusBadge tone="ok">دفعة مقدمة {formatEgp(o.depositAmount)}</StatusBadge>
                  ) : null}
                  {o.callAttempts > 0 ? (
                    <StatusBadge tone="warn">
                      اتصلنا {o.callAttempts.toLocaleString("ar-EG")} مرة
                    </StatusBadge>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
        {orders.length === 0 ? (
          <li className="rounded-3xl bg-white p-8 text-center text-sm">
            {tab === "pending" ? "مفيش طلبات محتاجة تأكيد دلوقتي." : "مفيش طلبات هنا."}
          </li>
        ) : null}
      </ul>

      {pages > 1 ? (
        <nav
          aria-label="الصفحات"
          className="mt-5 flex items-center justify-center gap-3 text-sm font-bold"
        >
          {page > 1 ? (
            <Link href={link(tab, page - 1)} className={softBtn}>
              السابق
            </Link>
          ) : null}
          <span>
            {page.toLocaleString("ar-EG")} / {pages.toLocaleString("ar-EG")}
          </span>
          {page < pages ? (
            <Link href={link(tab, page + 1)} className={softBtn}>
              التالي
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
