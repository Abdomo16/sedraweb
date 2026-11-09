import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  tone = "bg-white",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className={`rounded-card shadow-soft p-4 ${tone}`}>
      <p className="text-ink/75 text-sm">{label}</p>
      <p className="font-display text-leaf-900 mt-1 text-2xl font-extrabold md:text-3xl">{value}</p>
      {hint ? <p className="text-ink/70 mt-1 text-xs leading-5">{hint}</p> : null}
    </div>
  );
}

export type BarItem = { key: string; label: string; value: number; display: string; sub?: string };

/** Horizontal bars (plain HTML/CSS): the longest row is 100%. */
export function BarRows({
  items,
  empty = "لسه مفيش بيانات في الفترة دي.",
}: {
  items: BarItem[];
  empty?: string;
}) {
  if (items.length === 0) return <p className="text-ink/70 text-sm">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="grid gap-3">
      {items.map((i) => (
        <li key={i.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-bold">{i.label}</span>
            <span className="shrink-0 font-bold">{i.display}</span>
          </div>
          <div className="bg-leaf-50 mt-1 h-2.5 overflow-hidden rounded-full" aria-hidden="true">
            <div
              className="bg-leaf-500 h-full rounded-full"
              style={{ width: `${Math.max((i.value / max) * 100, i.value > 0 ? 3 : 0)}%` }}
            />
          </div>
          {i.sub ? <p className="text-ink/70 mt-0.5 text-xs">{i.sub}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/** Orders per day (or month): a small bar chart drawn on the server. */
export function DailyBars({
  data,
  byMonth,
}: {
  data: { key: string; orders: number }[];
  byMonth: boolean;
}) {
  if (data.length === 0) return <p className="text-ink/70 text-sm">مفيش طلبات في الفترة دي.</p>;
  const max = Math.max(...data.map((d) => d.orders), 1);
  const total = data.reduce((n, d) => n + d.orders, 0);
  const peak = data.reduce((a, b) => (b.orders > a.orders ? b : a), data[0]);
  const short = (key: string) => {
    const [y, m, d] = key.split("-");
    return byMonth ? `${m}/${y}` : `${d}/${m}`;
  };
  return (
    <figure>
      <div
        role="img"
        aria-label={`${total} طلب. أعلى ${byMonth ? "شهر" : "يوم"} ${short(peak.key)} بـ ${peak.orders} طلب`}
        className="flex h-40 items-end gap-1"
      >
        {data.map((d) => (
          <div
            key={d.key}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
            title={`${short(d.key)}: ${d.orders}`}
          >
            <div
              className="bg-leaf-500 rounded-t-md"
              style={{ height: `${d.orders ? Math.max((d.orders / max) * 100, 4) : 0}%` }}
            />
            {d.orders === 0 ? <div className="bg-leaf-100 h-0.5 rounded-full" /> : null}
          </div>
        ))}
      </div>
      <figcaption className="text-ink/70 mt-2 flex justify-between text-xs">
        <span>{short(data[0].key)}</span>
        <span>
          أعلى {byMonth ? "شهر" : "يوم"}: {short(peak.key)} ({peak.orders.toLocaleString("ar-EG")}{" "}
          طلب)
        </span>
        <span>{short(data[data.length - 1].key)}</span>
      </figcaption>
    </figure>
  );
}

export function Panel({
  title,
  children,
  note,
}: {
  title: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <section className="shadow-soft rounded-3xl bg-white p-4 md:p-6">
      <h2 className="font-display text-leaf-900 text-lg font-extrabold">{title}</h2>
      {note ? <p className="text-ink/70 mt-1 text-xs leading-5">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
