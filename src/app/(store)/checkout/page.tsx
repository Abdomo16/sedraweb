import type { Metadata } from "next";
import { CheckoutView } from "@/components/store/checkout/CheckoutView";
import { Container } from "@/components/ui/Layout";
import { checkoutOpen, getShippingInfo } from "@/features/shipping/rates";

export const metadata: Metadata = {
  title: "إتمام الطلب",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const shipping = await getShippingInfo();
  return (
    <Container className="py-6">
      {/* Focused checkout: the confirm bar owns the bottom of the screen on phones. */}
      <style>{"#bottom-tab-bar{display:none}"}</style>
      <h1 className="font-display text-leaf-900 mb-4 text-3xl font-extrabold">إتمام الطلب</h1>
      <CheckoutView shipping={shipping} open={checkoutOpen(shipping)} />
    </Container>
  );
}
