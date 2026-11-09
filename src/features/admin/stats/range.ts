const TZ = "Africa/Cairo";

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function cairoParts(date: Date) {
  const map: Record<string, number> = {};
  for (const p of formatter.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  return map;
}

/** "2026-11-09": the calendar day in Cairo for an instant. */
export function cairoDayKey(date: Date): string {
  const p = cairoParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** How far Cairo wall-clock time is ahead of UTC at an instant (handles daylight saving). */
function offsetMs(date: Date): number {
  const p = cairoParts(date);
  const wallAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return wallAsUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant when a Cairo calendar day starts. */
export function startOfCairoDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  const noonOffset = offsetMs(new Date(Date.UTC(y, m - 1, d, 12)));
  return new Date(Date.UTC(y, m - 1, d) - noonOffset);
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export type RangeId = "today" | "7d" | "30d" | "month" | "all" | "custom";

export type Range = {
  id: RangeId;
  label: string;
  /** Inclusive start / exclusive end; null means unbounded. */
  from: Date | null;
  to: Date | null;
  fromKey: string | null;
  toKey: string | null;
};

export const rangeTabs: { id: RangeId; label: string }[] = [
  { id: "today", label: "النهارده" },
  { id: "7d", label: "آخر 7 أيام" },
  { id: "30d", label: "آخر 30 يوم" },
  { id: "month", label: "الشهر ده" },
  { id: "all", label: "كل الفترة" },
];

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseRange(
  sp: Record<string, string | string[] | undefined>,
  now = new Date(),
): Range {
  const today = cairoDayKey(now);
  const id = one(sp.range) as RangeId;
  const from = one(sp.from);
  const to = one(sp.to);

  const bounded = (fromKey: string, toKey: string, rid: RangeId, label: string): Range => ({
    id: rid,
    label,
    fromKey,
    toKey,
    from: startOfCairoDay(fromKey),
    to: startOfCairoDay(addDays(toKey, 1)),
  });

  if (DAY_KEY.test(from) && DAY_KEY.test(to) && from <= to) {
    return bounded(from, to, "custom", `من ${from} إلى ${to}`);
  }
  if (id === "today") return bounded(today, today, "today", "النهارده");
  if (id === "7d") return bounded(addDays(today, -6), today, "7d", "آخر 7 أيام");
  if (id === "month") return bounded(`${today.slice(0, 8)}01`, today, "month", "الشهر ده");
  if (id === "all") {
    return { id: "all", label: "كل الفترة", from: null, to: null, fromKey: null, toKey: null };
  }
  return bounded(addDays(today, -29), today, "30d", "آخر 30 يوم");
}

/** Query string that reproduces a range (used by links and the export button). */
export function rangeQuery(range: Range): string {
  if (range.id === "custom" && range.fromKey && range.toKey) {
    return `from=${range.fromKey}&to=${range.toKey}`;
  }
  return `range=${range.id}`;
}
