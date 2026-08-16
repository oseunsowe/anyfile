import { Icon } from "@/components/ui/Icon";
import type { PlanStep } from "@/lib/planner";
import { cn } from "@/lib/cn";

/**
 * The plan shown *before* processing (plan.md §5): every step, why it is there,
 * where it runs, and which steps are safe to switch off.
 *
 * This is the screen that distinguishes "we figured out what needs doing" from
 * "here is a compressor" — so the reasons are part of the product, not chrome.
 */
export function PlanPreview({
  steps,
  disabledSteps,
  onToggleStep,
  className,
}: {
  steps: readonly PlanStep[];
  /** Ids the user has switched off. */
  disabledSteps?: ReadonlySet<string>;
  onToggleStep?: (id: string) => void;
  className?: string;
}) {
  if (steps.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-[0.8125rem] font-medium text-ink">
        Our plan — {steps.length} {steps.length === 1 ? "step" : "steps"}
      </p>

      <ol className="mt-3 space-y-px overflow-hidden rounded-card border border-line">
        {steps.map((step, index) => {
          const off = disabledSteps?.has(step.id) ?? false;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-3 bg-surface p-3.5",
                index > 0 && "border-t border-line",
                off && "opacity-50",
              )}
            >
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-[0.6875rem] font-semibold text-brand-ink"
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[0.8125rem] font-medium text-ink",
                    off && "line-through",
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                  {step.reason}
                </p>

                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[0.75rem] text-ink-subtle">
                  {step.processing === "device" ? (
                    <>
                      <Icon name="shieldCheck" className="size-3.5 text-success" />
                      Runs on your device
                    </>
                  ) : (
                    <>
                      <Icon name="cloud" className="size-3.5" />
                      Secure cloud processing
                    </>
                  )}
                </p>
              </div>

              {step.optional && onToggleStep ? (
                <label className="flex shrink-0 cursor-pointer items-center gap-2 text-[0.75rem] text-ink-muted">
                  <input
                    type="checkbox"
                    checked={!off}
                    onChange={() => onToggleStep(step.id)}
                    className="size-4 accent-brand"
                  />
                  <span className="sr-only sm:not-sr-only">Include</span>
                </label>
              ) : (
                <span className="shrink-0 text-[0.75rem] text-ink-subtle">
                  {step.optional ? "Optional" : "Required"}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
