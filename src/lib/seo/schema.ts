import { siteConfig } from "@/config/site";
import { minPrice } from "@/features/catalog/queries";
import type { Category, Product } from "@/features/catalog/types";

const abs = (path: string) => `${siteConfig.url}${path}`;

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function productSchema(product: Product, category: Category) {
  const inStock = product.variants.some((v) => v.stock > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(product.images.length ? { image: product.images.map((i) => abs(i.url)) } : {}),
    sku: product.variants[0]?.sku,
    category: category.name,
    brand: { "@type": "Brand", name: category.brand ?? siteConfig.name },
    ...(product.material ? { material: product.material } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: siteConfig.currency,
      lowPrice: minPrice(product) / 100,
      highPrice: Math.max(...product.variants.map((v) => v.price)) / 100,
      offerCount: product.variants.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: abs(`/products/${product.slug}`),
    },
  };
}

export function collectionSchema(category: Category, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.seoDescription,
    url: abs(`/collections/${category.slug}`),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: abs(`/products/${p.slug}`),
        name: p.name,
      })),
    },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}
