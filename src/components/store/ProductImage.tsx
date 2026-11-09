import Image from "next/image";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { Product } from "@/features/catalog/types";

/**
 * Product photo with a fixed 3:4 box (no layout shift). Falls back to the
 * illustrated placeholder when a product has no photo yet.
 */
export function ProductImage({
  product,
  index = 0,
  sizes,
  priority = false,
  className = "",
}: {
  product: Product;
  index?: number;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const image = product.images[index];
  if (!image) {
    return (
      <ImagePlaceholder
        tone={product.tone}
        label={`${product.name} - صورة ${index + 1}`}
        className={className}
      />
    );
  }
  return (
    <div className={`relative aspect-[3/4] w-full overflow-hidden bg-white ${className}`}>
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="object-cover"
      />
    </div>
  );
}
