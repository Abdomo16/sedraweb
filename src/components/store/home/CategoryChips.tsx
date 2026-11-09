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
    "flex min-h-11 items-center rounded-full px-4 text-sm font-bold whitespace-nowrap transition-colors active:scale-95";

  return (
    <nav aria-label="تصفح الأقسام" className="bg-cream border-leaf-700/10 border-b md:hidden">
      <ul className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4 py-2.5">
        <li className="shrink-0 snap-start">
          <Link href="/collections" className={`${chip} bg-leaf-700 hover:bg-leaf-900 text-white`}>
            كل الأقسام
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.slug} className="shrink-0 snap-start">
            <Link
              href={`/collections/${c.slug}`}
              className={`${chip} bg-leaf-100 text-leaf-900 hover:bg-leaf-500 hover:text-white`}
            >
              {c.shortName}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
