import type { Metadata } from "next";
import { CollectionView, collectionMetadata } from "@/components/store/CollectionView";
import { getCategories } from "@/features/catalog/queries";

// Unknown slugs (new categories/products added from the admin) render on demand.
export const instant = false;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return collectionMetadata(slug, 1);
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  return <CollectionView slug={slug} page={1} />;
}
