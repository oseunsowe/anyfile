import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The surface used everywhere in the reference: white plate, hairline border,
 * soft shadow, generous radius.
 */
export function Card({
  as,
  className,
  interactive = false,
  children,
  ...props
}: {
  as?: ElementType;
  className?: string;
  /** Adds hover affordance for cards that are links or buttons. */
  interactive?: boolean;
  children: ReactNode;
} & ComponentPropsWithoutRef<"div">) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "rounded-card border border-line bg-surface shadow-sm",
        interactive &&
          "transition-shadow duration-150 hover:border-line-strong hover:shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Soft tinted square that holds a tool-family icon (reference 1.1). */
export function IconTile({
  className,
  size = "md",
  children,
}: {
  className?: string;
  size?: "sm" | "md";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[0.625rem]",
        size === "sm" ? "size-8" : "size-10",
        className,
      )}
    >
      {children}
    </span>
  );
}
