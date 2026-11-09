export function formatEgp(piastres: number): string {
  const value = piastres / 100;
  return `${value.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`;
}

export function Price({
  price,
  compareAt,
  className = "",
}: {
  price: number;
  compareAt?: number;
  className?: string;
}) {
  return (
    <p className={`flex items-baseline gap-2 ${className}`}>
      <span className="text-leaf-900 font-bold">{formatEgp(price)}</span>
      {compareAt ? (
        <s className="text-ink/50 text-sm" aria-label="السعر قبل الخصم">
          {formatEgp(compareAt)}
        </s>
      ) : null}
    </p>
  );
}
