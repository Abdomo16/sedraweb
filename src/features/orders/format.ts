/** Customer-facing order number: 1001, 1002, ... (the database counter starts at 1). */
export function orderNumber(n: number): string {
  return String(1000 + n);
}

export const statusLabel = {
  PENDING: "محتاج تأكيد",
  CONFIRMED: "مؤكد",
  SHIPPED: "اتشحن",
  DELIVERED: "اتسلم",
  CANCELLED: "ملغي",
  RETURNED: "مرتجع",
} as const;
