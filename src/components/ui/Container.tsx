import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared page gutter so every section lines up on the same grid. */
export function Container({
  as,
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const Component = as ?? "div";
  return (
    <Component className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </Component>
  );
}

/** Section heading pair used across the marketing pages. */
export function SectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 className="text-2xl font-semibold text-ink sm:text-[1.75rem]">{title}</h2>
      {description ? (
        <p className="mt-2 text-[0.9375rem] text-ink-muted">{description}</p>
      ) : null}
    </div>
  );
}
