import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";

export const metadata: Metadata = { title: "السلة", robots: { index: false, follow: false } };

/** Placeholder: the real cart is built in Phase 5. */
export default function CartPage() {
  return (
    <Container className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="font-display text-leaf-900 text-3xl font-extrabold">السلة فاضية</h1>
      <p className="text-ink/70">ابدأ التسوق وضيف المنتجات اللي تعجبك.</p>
      <ButtonLink href="/collections">تسوّق دلوقتي</ButtonLink>
    </Container>
  );
}
