import type { Tone } from "@/features/catalog/types";

const tones: Record<Tone, { bg: string; fg: string; accent: string }> = {
  mint: { bg: "#e0eed3", fg: "#6aa63f", accent: "#f7cf2d" },
  sun: { bg: "#fdf2c4", fg: "#e0ac00", accent: "#3fa0dc" },
  sky: { bg: "#dff0fb", fg: "#3fa0dc", accent: "#f7cf2d" },
  sand: { bg: "#f5ecd8", fg: "#b98a45", accent: "#6aa63f" },
  rose: { bg: "#fbe3ea", fg: "#e07b9b", accent: "#f7cf2d" },
};

/**
 * Illustrated stand-in for product photography. Replaced by real images
 * (next/image) once the owner provides them. Fixed aspect ratio => no CLS.
 */
export function ImagePlaceholder({
  tone,
  label,
  className = "",
}: {
  tone: Tone;
  label: string;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative aspect-[3/4] w-full overflow-hidden ${className}`}
      style={{ backgroundColor: t.bg }}
    >
      <svg viewBox="0 0 160 200" className="absolute inset-0 size-full" aria-hidden="true">
        <circle cx="130" cy="38" r="16" fill={t.accent} opacity="0.85" />
        <circle cx="20" cy="168" r="30" fill={t.fg} opacity="0.12" />
        <path
          d="M52 62 80 52l28 10 18 26-16 10-8-12v70H58V86l-8 12-16-10 18-26Z"
          fill={t.fg}
          opacity="0.9"
        />
        <path d="M70 52c3 8 17 8 20 0" stroke={t.bg} strokeWidth="3" fill="none" />
        <g fill={t.bg}>
          <circle cx="72" cy="104" r="3" />
          <circle cx="90" cy="118" r="3" />
          <circle cx="74" cy="134" r="3" />
          <circle cx="92" cy="148" r="3" />
        </g>
      </svg>
    </div>
  );
}
