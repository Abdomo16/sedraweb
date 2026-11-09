import { getAdmin } from "@/features/admin/auth/guard";
import { parseRange } from "@/features/admin/stats/range";
import { orderNumber, statusLabel } from "@/features/orders/format";
import { db } from "@/lib/db";

/** Neutralise spreadsheet formulas: a cell starting with = + - @ must never be executed. */
function cell(value: string | number | null | undefined): string {
  let text = String(value ?? "").replace(/\r?\n/g, " ");
  if (/^[=+\-@\t]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

const egp = (piastres: number) => piastres / 100;

/** Orders of the chosen range as an Excel-friendly CSV (UTF-8 with BOM). Admin only. */
export async function GET(request: Request) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const range = parseRange(Object.fromEntries(url.searchParams));
  const orders = await db.order.findMany({
    where: {
      ...(range.from || range.to
        ? {
            createdAt: {
              ...(range.from ? { gte: range.from } : {}),
              ...(range.to ? { lt: range.to } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    include: { items: true },
    take: 20_000,
  });

  const fmt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Africa/Cairo",
  });
  const header = [
    "رقم الطلب",
    "التاريخ",
    "الاسم",
    "الموبايل",
    "المحافظة",
    "المدينة",
    "العنوان",
    "الحالة",
    "المنتجات",
    "إجمالي المنتجات",
    "الشحن",
    "الإجمالي",
    "دفعة مقدمة",
    "المطلوب عند الاستلام",
  ];
  const lines = orders.map((o) =>
    [
      orderNumber(o.number),
      fmt.format(o.createdAt),
      o.customerName,
      // Keep the leading zero in Excel: phones are validated digits, so this formula form is safe.
      `="${o.phone.replace(/\D/g, "")}"`,
      o.governorate,
      o.city,
      o.address,
      statusLabel[o.status],
      o.items.map((i) => `${i.name} (مقاس ${i.size}) × ${i.quantity}`).join(" | "),
      egp(o.subtotal),
      egp(o.shippingFee),
      egp(o.total),
      egp(o.depositAmount),
      egp(o.total - o.depositAmount),
    ]
      .map((v) => (typeof v === "string" && v.startsWith('="') && /^="\d+"$/.test(v) ? v : cell(v)))
      .join(","),
  );

  const csv = `﻿${[header.map(cell).join(","), ...lines].join("\r\n")}\r\n`;
  const name = `orders-${range.fromKey ?? "all"}-${range.toKey ?? "all"}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
