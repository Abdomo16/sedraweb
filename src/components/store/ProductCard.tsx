import Link from "next/link";
import { Badge } from "@/components/ui/Layout";
import { ProductImage } from "@/components/store/ProductImage";
import { Price } from "@/components/ui/Price";
import { minCompare, minPrice } from "@/features/catalog/queries";
import type { Product } from "@/features/catalog/types";

export function ProductCard({
  product,
  className = "",
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const available = product.variants.filter((v) => v.stock > 0).map((v) => v.size);
  const price = minPrice(product);
  const compare = minCompare(product);
  const discount = compare ? Math.round((1 - price / compare) * 100) : 0;
  const shown = available.slice(0, 3);
  const extra = available.length - shown.length;

  return (
    <article className={`group ${className}`}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="rounded-card shadow-soft relative overflow-hidden transition-transform group-hover:-translate-y-0.5">
          <ProductImage
            product={product}
            sizes="(min-width: 768px) 25vw, 50vw"
            priority={priority}
          />
          <span className="absolute start-2 top-2 flex flex-col items-start gap-1">
            {product.isNew ? <Badge>جديد</Badge> : null}
            {discount > 0 ? (
              <Badge tone="leaf">خصم {discount.toLocaleString("ar-EG")}%</Badge>
            ) : null}
          </span>
        </div>
        <h3 className="mt-2.5 line-clamp-2 min-h-12 text-sm leading-6 font-bold">{product.name}</h3>
        <Price price={price} compareAt={compare} className="text-base" />
        <div className="mt-1.5 flex flex-wrap items-center gap-1" aria-label="المقاسات المتاحة">
          {shown.length ? (
            <>
              {shown.map((s) => (
                <span
                  key={s}
                  className="bg-leaf-50 text-leaf-900 rounded-full px-2 py-0.5 text-[11px] font-bold"
                >
                  {s}
                </span>
              ))}
              {extra > 0 ? <span className="text-ink/75 text-[11px]">+{extra}</span> : null}
            </>
          ) : (
            <span className="text-ink/75 text-xs">غير متاح حالياً</span>
          )}
        </div>
      </Link>
    </article>
  );
}

export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
      {products.map((p) => (
        <li key={p.slug} className="w-40 shrink-0 snap-start md:w-52">
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}

/** `eagerCount`: how many leading cards are above the fold and load eagerly. */
export function ProductGrid({
  products,
  eagerCount = 0,
}: {
  products: Product[];
  eagerCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.slug}>
          <ProductCard product={p} priority={i < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
