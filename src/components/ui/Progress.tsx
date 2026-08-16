import { cn } from "@/lib/cn";

/**
 * Determinate progress. plan.md §4.4 forbids fake progress, so `value` is
 * required — an operation that cannot report real progress must use the
 * indeterminate variant below and say so.
 */
export function Progress({
  value,
  label,
  className,
}: {
  /** 0–100. */
  value: number;
  /** Announced to screen readers and shown as the step name (§12). */
  label: string;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-mono text-xs text-ink-muted tabular-nums">
          {clamped}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-canvas-alt"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/** For steps whose duration genuinely cannot be estimated. */
export function IndeterminateProgress({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <div
        role="progressbar"
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-canvas-alt"
      >
        <div className="h-full w-1/3 animate-pulse rounded-full bg-brand" />
      </div>
    </div>
  );
}
