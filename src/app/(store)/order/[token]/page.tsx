import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnMount } from "@/components/store/checkout/ClearCartOnMount";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { Container } from "@/components/ui/Layout";
import { formatEgp } from "@/components/ui/Price";
import { orderNumber } from "@/features/orders/format";
import { formatPhone } from "@/features/orders/phone";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "تم استلام طلبك",
  robots: { index: false, follow: false, nocache: true },
};

// Opened with a private link right after ordering; rendered per request.
export const instant = false;

export default async function OrderPage({ params }: PageProps<"/order/[token]">) {
  const { token } = await params;
  const order = await db.order.findUnique({
    where: { publicToken: token },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <Container size="narrow" className="py-8">
      <ClearCartOnMount />
      <div className="shadow-soft mx-auto max-w-2xl rounded-3xl bg-white p-6 md:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="bg-leaf-100 text-leaf-700 flex size-16 items-center justify-center rounded-full">
            <Icon name="check" className="size-8" />
          </span>
          <h1 className="font-display text-leaf-900 mt-4 text-3xl font-extrabold">
            تم استلام طلبك
          </h1>
          <p className="mt-1 text-sm font-bold">
            رقم الطلب <span className="text-leaf-700">#{orderNumber(order.number)}</span>
          </p>
          <p className="text-ink/85 mt-4 leading-8">
            هيتم التواصل مع حضرتك على رقم{" "}
            <span dir="ltr" className="font-bold">
              {formatPhone(order.phone)}
            </span>{" "}
            لتأكيد الأوردر.
          </p>
        </div>

        <section aria-label="المنتجات" className="mt-8">
          <ul className="divide-leaf-700/10 divide-y">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <span className="line-clamp-1 block font-bold">{i.name}</span>
                  <span className="text-ink/75 text-xs">
                    مقاس {i.size} · {i.quantity.toLocaleString("ar-EG")} قطعة
                  </span>
                </span>
                <span className="font-bold">{formatEgp(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between">
              <dt>المنتجات</dt>
              <dd className="font-bold">{formatEgp(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>الشحن</dt>
              <dd className="font-bold">
                {order.shippingFee === 0 ? "مجاني" : formatEgp(order.shippingFee)}
              </dd>
            </div>
            <div className="border-leaf-700/10 flex justify-between border-t pt-2 text-base">
              <dt className="font-bold">المطلوب عند الاستلام</dt>
              <dd className="font-display text-leaf-900 text-xl font-extrabold">
                {formatEgp(order.total)}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-label="عنوان التوصيل"
          className="bg-leaf-50 mt-6 rounded-2xl p-4 text-sm leading-7"
        >
          <p className="font-bold">عنوان التوصيل</p>
          <p>
            {order.customerName} · {order.governorate}، {order.city}
          </p>
          <p>{order.address}</p>
        </section>

        <div className="mt-8 flex flex-col items-center gap-3">
          <ButtonLink href="/collections" size="lg">
            كمّل التسوق
          </ButtonLink>
          <Link href="/" className="text-ink/75 text-sm underline underline-offset-4">
            الرجوع للرئيسية
          </Link>
        </div>
      </div>
    </Container>
  );
}
