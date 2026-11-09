/**
 * Small shapes taken from the Sedra logo (water drops, leaves, wave) used as soft
 * decoration. Purely visual: hidden from screen readers and ignored by clicks.
 */
export function Drop({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute rounded-full ${className}`} />
  );
}

export function Leaf({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      className={`pointer-events-none absolute ${className}`}
      fill="currentColor"
    >
      <path d="M6 34C6 16 16 6 34 6c0 18-10 28-28 28Z" />
    </svg>
  );
}

export function WaveLine({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 24"
      className={`pointer-events-none absolute ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path d="M3 14c5-10 12-10 17 0s12 10 17 0 12-10 17 0 12 10 17 0 12-10 17 0 12 10 17 0" />
    </svg>
  );
}
