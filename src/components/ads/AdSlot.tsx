import { cn } from "@/lib/cn";

/**
 * Ad placeholder with reserved dimensions.
 *
 * plan.md §7 / §14 rules encoded here:
 *  - The box always reserves its final height, so a late-loading creative
 *    cannot shift layout and damage CLS.
 *  - It is labelled "Advertisement" and styled as inert canvas, so it can never
 *    be mistaken for a Download button.
 *  - Paid tiers render nothing at all.
 *
 * Placement is still the caller's responsibility: never inside a drop zone, and
 * never between upload and the process button.
 */

export type AdFormat = "leaderboard" | "rectangle" | "rail";

const formats: Record<AdFormat, { className: string; label: string }> = {
  // 728x90 desktop, collapses to 320x100 on mobile.
  leaderboard: {
    className: "h-[100px] w-full max-w-[728px] sm:h-[90px]",
    label: "728x90",
  },
  // 300x250 medium rectangle.
  rectangle: { className: "h-[250px] w-full max-w-[300px]", label: "300x250" },
  // 300x600 desktop side rail — only rendered where width allows.
  rail: { className: "hidden h-[600px] w-[300px] xl:block", label: "300x600" },
};

export function AdSlot({
  format,
  isPaidUser = false,
  className,
}: {
  format: AdFormat;
  /** §6.2 — all paid tiers are ad-free. */
  isPaidUser?: boolean;
  className?: string;
}) {
  if (isPaidUser) return null;

  const { className: sizeClass, label } = formats[format];

  return (
    <aside
      aria-label="Advertisement"
      className={cn("mx-auto flex flex-col items-center gap-1.5", className)}
    >
      <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-ink-subtle">
        Advertisement
      </span>
      <div
        className={cn(
          "flex items-center justify-center rounded-card border border-dashed border-line",
          "bg-canvas-alt/60 text-xs text-ink-subtle",
          sizeClass,
        )}
      >
        {/* Replaced by the ad provider once one is selected (todo.md P1). */}
        <span className="font-mono">{label}</span>
      </div>
    </aside>
  );
}
