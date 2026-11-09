import { db } from "@/lib/db";
import { addDays, cairoDayKey, type Range } from "./range";

/** Orders that count as demand: everything except cancelled and returned. */
const COUNTED = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;
/** Orders that count as money: the team confirmed them. */
const CONFIRMED_SALES = ["CONFIRMED", "SHIPPED", "DELIVERED"] as const;

type Row = { key: string; label: string; pieces: number; revenue: number; orders: number };

export type Stats = {
  orders: number;
  confirmedOrders: number;
  confirmedSales: number;
  pendingOrders: number;
  pendingValue: number;
  averageOrder: number;
  cancelled: number;
  returned: number;
  lostRate: number;
  pieces: number;
  daily: { key: string; orders: number }[];
  dailyByMonth: boolean;
  bestProducts: (Row & { slug: string })[];
  slowProducts: { slug: string; name: string; pieces: number }[];
  byCategory: Row[];
  byAge: Row[];
  byBrand: Row[];
  byGovernorate: Row[];
  byPayment: Row[];
  customers: { total: number; fresh: number; returning: number };
  repeatCustomers: { phone: string; name: string; orders: number; spent: number }[];
  lowStock: { productId: string; name: string; size: string; stock: number }[];
  soldOutProducts: number;
};

const ageLabel: Record<string, string> = {
  BABY: "بيبي",
  KIDS: "أطفال",
  OLDER: "كبار",
  TEEN: "مراهقين",
  NONE: "بدون سن",
};
const paymentLabel: Record<string, string> = {
  COD: "دفع عند الاستلام",
  CARD: "فيزا",
  WALLET: "محفظة",
  INSTAPAY: "إنستاباي",
};

function stripSeen<T extends { seen: Set<string> }>(row: T): Omit<T, "seen"> {
  const { seen, ...rest } = row;
  void seen;
  return rest;
}

/** Adds one order line to a grouped table (orders are counted once per group). */
function bump(
  map: Map<string, Row & { seen: Set<string> }>,
  key: string,
  label: string,
  orderId: string,
  pieces: number,
  revenue: number,
) {
  const row = map.get(key) ?? {
    key,
    label,
    pieces: 0,
    revenue: 0,
    orders: 0,
    seen: new Set<string>(),
  };
  row.pieces += pieces;
  row.revenue += revenue;
  if (!row.seen.has(orderId)) {
    row.seen.add(orderId);
    row.orders += 1;
  }
  map.set(key, row);
}

const rows = (
  map: Map<string, Row & { seen: Set<string> }>,
  by: "revenue" | "pieces" = "revenue",
): Row[] =>
  [...map.values()].map((r) => stripSeen(r)).sort((a, b) => b[by] - a[by] || b.orders - a.orders);

export async function loadStats(range: Range): Promise<Stats> {
  const createdAt = {
    ...(range.from ? { gte: range.from } : {}),
    ...(range.to ? { lt: range.to } : {}),
  };
  const where = Object.keys(createdAt).length ? { createdAt } : {};

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      total: true,
      governorate: true,
      phone: true,
      customerName: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
          price: true,
          variant: {
            select: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  category: { select: { id: true, name: true, ageBand: true, brand: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  const counted = orders.filter((o) => (COUNTED as readonly string[]).includes(o.status));
  const confirmed = orders.filter((o) => (CONFIRMED_SALES as readonly string[]).includes(o.status));
  const pending = orders.filter((o) => o.status === "PENDING");
  const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
  const returned = orders.filter((o) => o.status === "RETURNED").length;

  const products = new Map<string, Row & { seen: Set<string>; slug: string }>();
  const categories = new Map<string, Row & { seen: Set<string> }>();
  const ages = new Map<string, Row & { seen: Set<string> }>();
  const brands = new Map<string, Row & { seen: Set<string> }>();
  const govs = new Map<string, Row & { seen: Set<string> }>();
  const payments = new Map<string, Row & { seen: Set<string> }>();
  let pieces = 0;

  for (const o of counted) {
    bump(govs, o.governorate, o.governorate, o.id, 0, o.total);
    bump(
      payments,
      o.paymentMethod,
      paymentLabel[o.paymentMethod] ?? o.paymentMethod,
      o.id,
      0,
      o.total,
    );
    for (const item of o.items) {
      const p = item.variant.product;
      const revenue = item.price * item.quantity;
      pieces += item.quantity;
      bump(products, p.id, p.name, o.id, item.quantity, revenue);
      products.get(p.id)!.slug = p.slug;
      bump(categories, p.category.id, p.category.name, o.id, item.quantity, revenue);
      const age = p.category.ageBand ?? "NONE";
      bump(ages, age, ageLabel[age] ?? age, o.id, item.quantity, revenue);
      const brand = p.category.brand ?? "سيدرا";
      bump(brands, brand, brand, o.id, item.quantity, revenue);
    }
  }
  // Pieces are tracked per line; governorate and payment tables are about order value.
  const govRows = rows(govs);
  const payRows = rows(payments);

  const productRows = [...products.values()]
    .map((r) => stripSeen(r))
    .sort((a, b) => b.pieces - a.pieces || b.revenue - a.revenue);

  // Orders per day (or per month when the range is long).
  const counts = new Map<string, number>();
  const keyOf = (d: Date) => cairoDayKey(d);
  const longRange =
    !range.fromKey || !range.toKey
      ? true
      : (Date.parse(range.toKey) - Date.parse(range.fromKey)) / 86_400_000 > 62;
  for (const o of orders) {
    const day = keyOf(o.createdAt);
    const key = longRange ? day.slice(0, 7) : day;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let daily: { key: string; orders: number }[] = [];
  if (!longRange && range.fromKey && range.toKey) {
    for (let k = range.fromKey; k <= range.toKey; k = addDays(k, 1)) {
      daily.push({ key: k, orders: counts.get(k) ?? 0 });
    }
  } else {
    daily = [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, n]) => ({ key, orders: n }));
  }

  // Customers: new vs returning, by phone.
  const phones = [...new Set(counted.map((o) => o.phone))];
  const history = phones.length
    ? await db.order.groupBy({
        by: ["phone"],
        where: { phone: { in: phones }, status: { in: [...COUNTED] } },
        _min: { createdAt: true },
      })
    : [];
  const firstSeen = new Map(history.map((h) => [h.phone, h._min.createdAt as Date]));
  const perPhone = new Map<string, { name: string; orders: number; spent: number }>();
  for (const o of counted) {
    const e = perPhone.get(o.phone) ?? { name: o.customerName, orders: 0, spent: 0 };
    e.orders += 1;
    e.spent += o.total;
    e.name = o.customerName;
    perPhone.set(o.phone, e);
  }
  let returning = 0;
  for (const [phone, e] of perPhone) {
    const before = range.from && (firstSeen.get(phone) ?? range.from) < range.from;
    if (before || e.orders > 1) returning += 1;
  }

  // Stock alerts and slow movers (published products only).
  const [lowStock, soldOutProducts, published] = await Promise.all([
    db.variant.findMany({
      where: { stock: { gt: 0, lte: 3 }, product: { status: "ACTIVE" } },
      orderBy: { stock: "asc" },
      take: 12,
      select: { size: true, stock: true, product: { select: { id: true, name: true } } },
    }),
    db.product.count({ where: { status: "ACTIVE", variants: { none: { stock: { gt: 0 } } } } }),
    db.product.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, slug: true, name: true },
    }),
  ]);
  const slowProducts = published
    .map((p) => ({ slug: p.slug, name: p.name, pieces: products.get(p.id)?.pieces ?? 0 }))
    .sort((a, b) => a.pieces - b.pieces)
    .slice(0, 8);

  const confirmedSales = confirmed.reduce((n, o) => n + o.total, 0);
  return {
    orders: orders.length,
    confirmedOrders: confirmed.length,
    confirmedSales,
    pendingOrders: pending.length,
    pendingValue: pending.reduce((n, o) => n + o.total, 0),
    averageOrder: confirmed.length ? Math.round(confirmedSales / confirmed.length) : 0,
    cancelled,
    returned,
    lostRate: orders.length ? Math.round(((cancelled + returned) / orders.length) * 100) : 0,
    pieces,
    daily,
    dailyByMonth: longRange,
    bestProducts: productRows.slice(0, 8) as Stats["bestProducts"],
    slowProducts,
    byCategory: rows(categories),
    byAge: rows(ages),
    byBrand: rows(brands),
    byGovernorate: govRows,
    byPayment: payRows,
    customers: { total: perPhone.size, fresh: perPhone.size - returning, returning },
    repeatCustomers: [...perPhone.entries()]
      .filter(([, e]) => e.orders > 1)
      .map(([phone, e]) => ({ phone, ...e }))
      .sort((a, b) => b.orders - a.orders || b.spent - a.spent)
      .slice(0, 8),
    lowStock: lowStock.map((v) => ({
      productId: v.product.id,
      name: v.product.name,
      size: v.size,
      stock: v.stock,
    })),
    soldOutProducts,
  };
}
