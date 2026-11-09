import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "soft" | "ghost" | "sun";
type Size = "md" | "lg";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700 disabled:cursor-not-allowed disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "bg-leaf-700 text-white hover:bg-leaf-900",
  sun: "bg-sun-400 text-leaf-900 hover:bg-sun-500",
  soft: "bg-leaf-100 text-leaf-900 hover:bg-leaf-50",
  ghost: "border border-leaf-700/25 text-leaf-900 hover:bg-leaf-50",
};
const sizes: Record<Size, string> = { md: "px-5 text-sm", lg: "px-7 text-base" };

function cls(variant: Variant, size: Size, extra?: string) {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra ?? ""}`;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cls(variant, size, className)} {...props} />;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cls(variant, size, className)} {...props} />;
}
