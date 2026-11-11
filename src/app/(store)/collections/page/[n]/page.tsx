import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ListingView, listingMetadata } from "@/components/store/ListingView";

// The number of pages depends on the catalog, so later pages render on demand.
export const instant = false;

function parsePage(n: string): number | null {
  return /^\d+$/.test(n) ? Number(n) : null;
}

export async function generateMetadata({ params }: PageProps<"/collections/page/[n]">): Promise<Metadata> {
  const page = parsePage((await params).n);
  return page && page >= 2 ? listingMetadata("all", page) : {};
}

export default async function AllCollectionsPageN({ params }: PageProps<"/collections/page/[n]">) {
  const page = parsePage((await params).n);
  if (!page || page < 1) notFound();
  // Page 1 has one address only: the plain listing URL.
  if (page === 1) permanentRedirect("/collections");
  return <ListingView kind="all" page={page} />;
}
