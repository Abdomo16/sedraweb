import type { Metadata } from "next";
import { ListingView, listingMetadata } from "@/components/store/ListingView";

export const metadata: Metadata = listingMetadata("new", 1);

export default function NewArrivalsPage() {
  return <ListingView kind="new" page={1} />;
}
