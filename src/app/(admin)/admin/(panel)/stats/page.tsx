import Link from "next/link";
import { BarRows, DailyBars, Panel, StatCard, type BarItem } from "@/components/admin/stats";
import { inputCls, softBtn } from "@/components/admin/ui";
import { formatEgp } from "@/components/ui/Price";
import { requireAdmin } from "@/features/admin/auth/guard";
import { loadStats } from "@/features/admin/stats/queries";
import { parseRange, rangeQuery, rangeTabs } from "@/features/admin/stats/range";
import { formatPhone } from "@/features/orders/phone";

const n = (v: number) => v.toLocaleString("ar-EG");

export default async function StatsPage({ searchParams }: PageProps<"/admin/stats">) {
  await requireAdmin();
  const range = parseRange(await searchParams);
  const s = await loadStats(range);

  const money = (
    rows: { key: string; label: string; revenue: number; orders: number; pieces: number }[],
  ): BarItem[] =>
    rows.map((r) => ({
      key: r.key,
      label: r.label,
      value: r.revenue,
      display: formatEgp(r.revenue),
      sub: `${n(r.orders)} طلب${r.pieces ? ` · ${n(r.pieces)} قطعة` : ""}`,
    }));

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-leaf-900 text-2xl font-extrabold">إحصائيات</h1>
          <p className="text-ink/70 text-sm">الفترة: {range.label} (بتوقيت القاهرة)</p>
        </div>
        <a href={`/admin/api/orders/export?${rangeQuery(range)}`} className={softBtn}>
          تحميل الطلبات (Excel)
        </a>
      </div>

      <nav aria-label="الفترة" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {rangeTabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin/stats?range=${t.id}`}
            aria-current={range.id === t.id ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-bold transition-colors ${
              range.id === t.id
                ? "bg-leaf-700 text-white"
                : "text-leaf-900 hover:bg-leaf-100 bg-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <form
        action="/admin/stats"
        className="shadow-soft flex flex-wrap items-end gap-3 rounded-3xl bg-white p-3"
      >
        <label className="text-xs font-bold">
          من
          <input
            type="date"
            name="from"
            defaultValue={range.fromKey ?? ""}
            dir="ltr"
            className={`${inputCls} mt-1 min-h-10`}
          />
        </label>
        <label className="text-xs font-bold">
          إلى
          <input
            type="date"
            name="to"
            defaultValue={range.toKey ?? ""}
            dir="ltr"
            className={`${inputCls} mt-1 min-h-10`}
          />
        </label>
        <button className={softBtn}>عرض</button>
      </form>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="الطلبات" value={n(s.orders)} hint="كل الطلبات في الفترة بكل حالاتها" />
        <StatCard
          label="مبيعات مؤكدة"
          value={formatEgp(s.confirmedSales)}
          hint={`${n(s.confirmedOrders)} طلب مؤكد أو اتشحن أو اتسلم`}
          tone="bg-leaf-100"
        />
        <StatCard
          label="مستنية التأكيد"
          value={formatEgp(s.pendingValue)}
          hint={`${n(s.pendingOrders)} طلب لسه محتاج اتصال`}
          tone="bg-sun-100"
        />
        <StatCard label="متوسط الطلب" value={formatEgp(s.averageOrder)} hint="من الطلبات المؤكدة" />
        <StatCard
          label="ملغي ومرتجع"
          value={`${n(s.lostRate)}٪`}
          hint={`${n(s.cancelled)} ملغي · ${n(s.returned)} مرتجع`}
        />
        <StatCard label="قطع مطلوبة" value={n(s.pieces)} hint="من الطلبات غير الملغية" />
      </div>

      <Panel title={s.dailyByMonth ? "الطلبات في الشهر" : "الطلبات في اليوم"}>
        <DailyBars data={s.daily} byMonth={s.dailyByMonth} />
      </Panel>

      <div className="grid gap-5 md:grid-cols-2">
        <Panel
          title="الأكتر مبيعاً"
          note="حسب عدد القطع في الطلبات غير الملغية (بما فيها اللي لسه محتاجة تأكيد)."
        >
          <BarRows
            items={s.bestProducts.map((p) => ({
              key: p.key,
              label: p.label,
              value: p.pieces,
              display: `${n(p.pieces)} قطعة`,
              sub: `${formatEgp(p.revenue)} · ${n(p.orders)} طلب`,
            }))}
          />
        </Panel>
        <Panel title="الأقل مبيعاً" note="منتجات منشورة، الأقل طلباً في الفترة (ممكن صفر).">
          <BarRows
            items={s.slowProducts.map((p) => ({
              key: p.slug,
              label: p.name,
              value: p.pieces,
              display: `${n(p.pieces)} قطعة`,
            }))}
            empty="مفيش منتجات منشورة لسه."
          />
        </Panel>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="المبيعات حسب القسم">
          <BarRows items={money(s.byCategory)} />
        </Panel>
        <div className="grid gap-5">
          <Panel title="حسب الفئة العمرية">
            <BarRows items={money(s.byAge)} />
          </Panel>
          <Panel title="حسب الماركة">
            <BarRows items={money(s.byBrand)} />
          </Panel>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="الطلبات حسب المحافظة" note="قيمة الطلبات غير الملغية.">
          <BarRows items={money(s.byGovernorate).slice(0, 10)} />
        </Panel>
        <Panel title="طريقة الدفع">
          <BarRows items={money(s.byPayment)} />
        </Panel>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Panel
          title="العملاء"
          note="العميل الراجع هو اللي طلب قبل الفترة دي أو أكتر من مرة فيها (بالموبايل)."
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            <StatCard label="إجمالي" value={n(s.customers.total)} />
            <StatCard label="جدد" value={n(s.customers.fresh)} tone="bg-leaf-100" />
            <StatCard label="راجعين" value={n(s.customers.returning)} tone="bg-sun-100" />
          </div>
          {s.repeatCustomers.length ? (
            <ul className="divide-leaf-700/10 mt-4 divide-y text-sm">
              {s.repeatCustomers.map((c) => (
                <li key={c.phone} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{c.name}</span>
                    <span dir="ltr" className="text-ink/70 block text-start text-xs">
                      {formatPhone(c.phone)}
                    </span>
                  </span>
                  <span className="text-end">
                    <span className="block font-bold">{n(c.orders)} طلب</span>
                    <span className="text-ink/70 text-xs">{formatEgp(c.spent)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>

        <Panel title="تنبيهات المخزون" note="مقاسات منشورة فاضل منها 3 قطع أو أقل.">
          <p className="mb-3 text-sm font-bold">
            منتجات نفدت بالكامل:{" "}
            <Link
              href="/admin/products?status=ACTIVE&stock=out"
              className="text-leaf-700 underline"
            >
              {n(s.soldOutProducts)}
            </Link>
          </p>
          {s.lowStock.length ? (
            <ul className="divide-leaf-700/10 divide-y text-sm">
              {s.lowStock.map((v) => (
                <li
                  key={`${v.productId}-${v.size}`}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <Link
                    href={`/admin/products/${v.productId}`}
                    className="min-w-0 truncate font-bold hover:underline"
                  >
                    {v.name} <span className="text-ink/70 font-normal">· مقاس {v.size}</span>
                  </Link>
                  <span className="shrink-0 font-bold text-amber-700">فاضل {n(v.stock)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink/70 text-sm">مفيش مقاسات على وشك الخلاص.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
