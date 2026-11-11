import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CollectionView, collectionMetadata } from "@/components/store/CollectionView";

// Pages beyond the first render on demand (the number of pages depends on the catalog).
export const instant = false;

function parsePage(n: string): number | null {
  return /^\d+$/.test(n) ? Number(n) : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]/page/[n]">): Promise<Metadata> {
  const { slug, n } = await params;
  const page = parsePage(n);
  if (!page || page < 2) return {};
  return collectionMetadata(slug, page);
}

export default async function CollectionPageN({
  params,
}: PageProps<"/collections/[slug]/page/[n]">) {
  const { slug, n } = await params;
  const page = parsePage(n);
  if (!page || page < 1) notFound();
  // Page 1 has one address only: the plain collection URL.
  if (page === 1) permanentRedirect(`/collections/${slug}`);
  return <CollectionView slug={slug} page={page} />;
}
