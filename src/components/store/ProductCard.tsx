import Link from "next/link";
import { Badge } from "@/components/ui/Layout";
import { ProductImage } from "@/components/store/ProductImage";
import { Icon } from "@/components/ui/Icons";
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
    <article className={`group card-lift ${className}`}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="card-frame relative overflow-hidden rounded-xl">
          <ProductImage
            product={product}
            sizes="(min-width: 1408px) 340px, (min-width: 768px) 25vw, 50vw"
            priority={priority}
          />
          <span className="absolute start-2.5 top-2.5 flex flex-col items-start gap-1">
            {product.isNew ? <Badge>جديد</Badge> : null}
            {discount > 0 ? (
              <Badge tone="leaf">خصم {discount.toLocaleString("ar-EG")}%</Badge>
            ) : null}
          </span>
          <span
            aria-hidden="true"
            className="card-cta bg-leaf-900 absolute end-2.5 bottom-2.5 flex size-9 items-center justify-center rounded-lg text-white"
          >
            <Icon name="bag" className="size-[1.15rem]" />
          </span>
        </div>
        <h3 className="text-ink mt-3 line-clamp-2 min-h-12 text-sm leading-6 font-bold">{product.name}</h3>
        <Price price={price} compareAt={compare} className="text-base" />
        <p className="text-ink/60 mt-1 text-xs leading-5 text-balance" aria-label="المقاسات المتاحة">
          {shown.length ? (
            <>
              {shown.join(" · ")}
              {extra > 0 ? ` · +${extra}` : ""}
            </>
          ) : (
            "غير متاح حالياً"
          )}
        </p>
      </Link>
    </article>
  );
}

export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
      {products.map((p) => (
        <li key={p.slug} className="w-44 shrink-0 snap-start md:w-60 lg:w-[calc(25%-0.57rem)]">
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
    <ul className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-10">
      {products.map((p, i) => (
        <li key={p.slug} className={i < Math.max(eagerCount, 4) ? undefined : "reveal"}>
          <ProductCard product={p} priority={i < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
