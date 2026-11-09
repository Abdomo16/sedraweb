import type { Metadata } from "next";
import { CartPageView } from "@/components/store/cart/CartPageView";
import { Container } from "@/components/ui/Layout";

export const metadata: Metadata = { title: "السلة", robots: { index: false, follow: false } };

export default function CartPage() {
  return (
    <Container className="py-6">
      <h1 className="font-display text-leaf-900 mb-4 text-3xl font-extrabold">سلة التسوق</h1>
      <CartPageView />
    </Container>
  );
}
