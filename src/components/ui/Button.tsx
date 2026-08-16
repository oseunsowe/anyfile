import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "solid" | "brand" | "outline" | "ghost" | "soft";
export type ButtonSize = "sm" | "md" | "lg";

const base = cn(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap",
  "rounded-control font-medium",
  "transition-colors duration-150",
  "disabled:pointer-events-none disabled:opacity-50",
  // Large enough to satisfy the §12 touch-target requirement at every size.
  "select-none",
);

const variants: Record<ButtonVariant, string> = {
  // Primary CTA in the reference is near-black, not the brand indigo.
  solid: "bg-solid text-ink-inverse hover:bg-solid-hover",
  brand: "bg-brand text-white hover:bg-brand-hover",
  outline: "border border-line-strong bg-surface text-ink hover:bg-surface-muted",
  ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
  soft: "bg-brand-soft text-brand-ink hover:bg-brand-soft-hover",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.9375rem]",
};

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export function buttonClasses({
  variant = "solid",
  size = "md",
  className,
}: Omit<SharedProps, "children">) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: SharedProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  children,
  href,
  ...props
}: SharedProps & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      href={href}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {children}
    </Link>
  );
}
