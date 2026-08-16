import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const fieldClasses = cn(
  "w-full rounded-control border border-line bg-surface",
  "px-3.5 text-[0.9375rem] text-ink placeholder:text-ink-subtle",
  "transition-colors hover:border-line-strong",
  "focus:border-brand focus:outline-none focus-visible:outline-none",
  "focus:ring-2 focus:ring-brand/25",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/25",
);

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return <input className={cn(fieldClasses, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={cn(fieldClasses, "py-2.5", className)} {...props} />;
}

/**
 * Label + field + help/error. Every input in the app must be labelled — §12
 * requires screen-reader-visible labels on file inputs and form controls.
 */
export function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        // Not colour-only: the message itself carries the meaning (§12).
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
