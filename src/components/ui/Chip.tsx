import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const chipClasses = cn(
  "inline-flex items-center gap-1.5 rounded-full border border-line",
  "bg-surface px-3.5 py-2 text-[0.8125rem] font-medium text-ink-muted",
  "transition-colors hover:border-line-strong hover:bg-surface-muted hover:text-ink",
);

/**
 * Popular-intent shortcut on the hero (plan.md §4.2). Each chip is a real link
 * to a tool landing page, so it doubles as internal linking for §8.2.
 */
export function IntentChip({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(chipClasses, className)}>
      {children}
    </Link>
  );
}

/** Non-navigating variant, e.g. filter tabs in the tools directory. */
export function FilterChip({
  active = false,
  className,
  children,
  ...props
}: {
  active?: boolean;
  className?: string;
  children: ReactNode;
} & React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        chipClasses,
        active && "border-transparent bg-solid text-ink-inverse hover:bg-solid-hover hover:text-ink-inverse",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
