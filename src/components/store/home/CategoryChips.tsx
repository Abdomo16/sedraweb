import Link from "next/link";
import { getCategories } from "@/features/catalog/queries";

/**
 * Phones only: a swipeable row of text chips right under the header (the same list as the
 * desktop menu), starting with "كل الأقسام". On desktop the header menu does this job.
 */
export async function CategoryChips() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  const chip =
    "flex min-h-10 items-center rounded-lg px-4 text-sm font-bold whitespace-nowrap transition-colors active:scale-95";

  return (
    <nav aria-label="تصفح الأقسام" className="border-leaf-900/10 border-b bg-white md:hidden">
      <ul className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4 py-2.5">
        <li className="shrink-0 snap-start">
          <Link href="/collections" className={`${chip} bg-leaf-900 hover:bg-leaf-700 text-white`}>
            كل الأقسام
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.slug} className="shrink-0 snap-start">
            <Link
              href={`/collections/${c.slug}`}
              className={`${chip} border-leaf-900/15 text-leaf-900 hover:bg-leaf-50 border bg-white`}
            >
              {c.shortName}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
