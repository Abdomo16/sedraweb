import Link from "next/link";

/** Which page numbers to show: all of them when few, otherwise 1 … current±1 … last. */
function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

const chevron = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    className="size-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

/**
 * Numbered pages made of real links (crawlable, no JavaScript needed). Renders nothing
 * when everything fits on one page. `hrefFor(1)` should be the plain collection URL.
 */
export function Pagination({
  current,
  total,
  hrefFor,
}: {
  current: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  if (total <= 1) return null;
  const base =
    "tap flex size-10 items-center justify-center rounded-lg text-sm font-bold sm:size-11";
  return (
    <nav aria-label="صفحات المنتجات" className="mt-8">
      <ul className="flex items-center justify-center gap-1 sm:gap-1.5">
        <li>
          {current > 1 ? (
            <Link
              href={hrefFor(current - 1)}
              rel="prev"
              aria-label="الصفحة السابقة"
              className={`${base} border-leaf-900/15 text-leaf-900 hover:bg-leaf-50 border bg-white`}
            >
              {chevron("m9 6 6 6-6 6")}
            </Link>
          ) : (
            <span className={`${base} text-ink/25 border border-transparent`} aria-hidden="true">
              {chevron("m9 6 6 6-6 6")}
            </span>
          )}
        </li>
        {pageList(current, total).map((p, i) =>
          p === "gap" ? (
            <li key={`g${i}`} aria-hidden="true" className="text-ink/50 w-3 text-center font-bold sm:w-4">
              …
            </li>
          ) : (
            <li key={p}>
              {p === current ? (
                <span
                  aria-current="page"
                  aria-label={`الصفحة ${p.toLocaleString("ar-EG")}، الحالية`}
                  className={`${base} bg-leaf-900 text-white`}
                >
                  {p.toLocaleString("ar-EG")}
                </span>
              ) : (
                <Link
                  href={hrefFor(p)}
                  aria-label={`الصفحة ${p.toLocaleString("ar-EG")}`}
                  className={`${base} border-leaf-900/15 text-leaf-900 hover:bg-leaf-50 border bg-white`}
                >
                  {p.toLocaleString("ar-EG")}
                </Link>
              )}
            </li>
          ),
        )}
        <li>
          {current < total ? (
            <Link
              href={hrefFor(current + 1)}
              rel="next"
              aria-label="الصفحة التالية"
              className={`${base} border-leaf-900/15 text-leaf-900 hover:bg-leaf-50 border bg-white`}
            >
              {chevron("m15 6-6 6 6 6")}
            </Link>
          ) : (
            <span className={`${base} text-ink/25 border border-transparent`} aria-hidden="true">
              {chevron("m15 6-6 6 6 6")}
            </span>
          )}
        </li>
      </ul>
      <p className="text-ink/70 mt-2 text-center text-xs">
        صفحة {current.toLocaleString("ar-EG")} من {total.toLocaleString("ar-EG")}
      </p>
    </nav>
  );
}
