import { Notice } from "@/components/admin/ui";
import { ShippingForm } from "@/components/admin/ShippingForm";
import { GOVERNORATES } from "@/config/governorates";
import { requireAdmin } from "@/features/admin/auth/guard";
import { egpString } from "@/features/admin/catalog/utils";
import { loadShippingInfo } from "@/features/shipping/rates";

export default async function ShippingPage({ searchParams }: PageProps<"/admin/shipping">) {
  await requireAdmin();
  const sp = await searchParams;
  const info = await loadShippingInfo();

  return (
    <div>
      <h1 className="font-display text-leaf-900 text-2xl font-extrabold">أسعار الشحن</h1>
      <p className="text-ink/70 mt-1 text-sm">
        السعر اللي العميل بيدفعه حسب المحافظة. هو اللي بيظهر في السلة وصفحة الطلب.
      </p>

      <div className="mt-4 grid gap-2">
        {sp.saved ? <Notice>تم حفظ أسعار الشحن.</Notice> : null}
        {!info.confirmed ? (
          <Notice tone="warn">
            الأسعار الحالية تجريبية، ومش هيتم استقبال طلبات في الموقع الحقيقي لحد ما تعتمدها.
          </Notice>
        ) : null}
      </div>

      <div className="mt-4">
        <ShippingForm
          rates={GOVERNORATES.map((g) => ({
            governorate: g,
            price: egpString(info.rates[g] ?? 0) || "0",
          }))}
          freeOver={info.freeOver ? egpString(info.freeOver) : ""}
          confirmed={info.confirmed}
        />
      </div>
    </div>
  );
}
