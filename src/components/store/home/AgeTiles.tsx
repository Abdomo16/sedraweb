import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Layout";
import { ageTiles } from "@/config/home";
import { getCategories } from "@/features/catalog/queries";
import { SectionTitle } from "../HomeSections";

/** Four big photo tiles, one per age group, each with direct links for girls and boys. */
export async function AgeTiles() {
  const categories = await getCategories();
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  const tiles = ageTiles
    .map((t) => ({
      ...t,
      cover: bySlug.get(t.cover),
      girls: bySlug.get(t.girls.slug) ? t.girls : null,
      boys: bySlug.get(t.boys.slug) ? t.boys : null,
    }))
    .filter((t) => t.cover?.image);
  if (tiles.length === 0) return null;

  return (
    <section aria-labelledby="age-title" className="py-8">
      <Container>
        <SectionTitle id="age-title">تسوّق حسب السن</SectionTitle>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {tiles.map((t) => {
            const main = t.girls ?? t.boys;
            if (!main) return null;
            return (
              <li key={t.label} className="reveal group relative">
                <Link
                  href={`/collections/${main.slug}`}
                  aria-label={`${t.label} ${t.sub}`}
                  className={`rounded-card shadow-soft relative block aspect-[4/5] overflow-hidden ${t.tone}`}
                >
                  <Image
                    src={t.cover!.image!}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"
                  />
                </Link>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 md:p-4">
                  <p className="font-display text-xl leading-7 font-extrabold text-white md:text-2xl">
                    {t.label}
                  </p>
                  <p className="text-xs text-white/90 md:text-sm">{t.sub}</p>
                  <div className="pointer-events-auto mt-2 flex flex-wrap gap-1.5 text-xs font-bold">
                    {[t.girls, t.boys].map((l) =>
                      l ? (
                        <Link
                          key={l.slug}
                          href={`/collections/${l.slug}`}
                          className="text-leaf-900 hover:bg-sun-400 flex min-h-9 items-center rounded-full bg-white/95 px-3.5 transition-colors"
                        >
                          {l.label}
                        </Link>
                      ) : null,
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
