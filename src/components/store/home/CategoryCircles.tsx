import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/features/catalog/queries";

/**
 * Phones only: a swipeable row of round category photos right under the header, so every
 * collection is one tap away (on desktop the same links are in the header menu).
 */
export async function CategoryCircles() {
  const categories = (await getCategories()).filter((c) => c.image);
  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="تصفح الأقسام بالصور"
      className="bg-cream border-leaf-700/10 border-b md:hidden"
    >
      <ul className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 py-3">
        {categories.map((c) => (
          <li key={c.slug} className="w-[4.5rem] shrink-0 snap-start">
            <Link href={`/collections/${c.slug}`} className="group block text-center">
              <span
                className={`ring-offset-cream ring-leaf-500 relative mx-auto block size-16 overflow-hidden rounded-full ring-2 ring-offset-2 transition-transform group-active:scale-95`}
              >
                <Image
                  src={c.image!}
                  alt=""
                  fill
                  sizes="64px"
                  fetchPriority="low"
                  className="object-cover object-[50%_12%]"
                />
              </span>
              <span className="text-leaf-900 mt-1.5 line-clamp-2 block text-xs leading-4 font-bold">
                {c.shortName}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
