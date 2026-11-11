import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "soft" | "ghost" | "sun";
type Size = "md" | "lg";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-bold transition duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700 disabled:cursor-not-allowed disabled:opacity-50";
// "sun" is the main call to action (add to cart, confirm); it is deep green now, and
// the yellow stays an accent for small marks only.
const variants: Record<Variant, string> = {
  primary: "bg-leaf-700 text-white hover:bg-leaf-900",
  sun: "bg-leaf-900 text-white hover:bg-leaf-700",
  soft: "bg-leaf-50 text-leaf-900 hover:bg-leaf-100",
  ghost: "border border-leaf-900/20 text-leaf-900 hover:bg-leaf-50",
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
