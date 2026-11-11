import type { Metadata } from "next";
import { ListingView, listingMetadata } from "@/components/store/ListingView";

export const metadata: Metadata = listingMetadata("all", 1);

export default function CollectionsPage() {
  return <ListingView kind="all" page={1} />;
}
