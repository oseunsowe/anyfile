"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TaskSurface } from "@/components/tools/TaskSurface";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { EASE } from "@/components/motion/Reveal";
import { parseIntent } from "@/lib/intent";
import { describeRequirement, isEmptyRequirement } from "@/lib/requirement";
import { useFilePipeline } from "@/lib/useFilePipeline";
import { cn } from "@/lib/cn";

/** Quick-fill outcomes, phrased the way users describe the problem (§4.2). */
const EXAMPLES = [
  "Make this under 2 MB for a job application",
  "Remove the location from this photo",
  "Make this small enough to email",
  "Resize to 1280x720 as JPG",
] as const;

export function SmartFixConsole({ className }: { className?: string }) {
  const [outcome, setOutcome] = useState("");

  const parsed = useMemo(() => parseIntent(outcome), [outcome]);
  const pipeline = useFilePipeline({
    requirement: parsed.requirement,
    actions: parsed.actions,
  });

  const summary = isEmptyRequirement(parsed.requirement)
    ? null
    : describeRequirement(parsed.requirement);

  return (
    <Card data-testid="smartfix-console" className={cn("p-5 shadow-lg sm:p-6", className)}>
      <label htmlFor="outcome" className="block scroll-mt-24 text-[0.8125rem] font-medium text-ink">
        What do you need?
      </label>

      <div className="relative mt-2">
        <Icon
          name="sparkle"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand"
        />
        <input
          id="outcome"
          value={outcome}
          onChange={(event) => setOutcome(event.target.value)}
          placeholder="Make this under 2 MB for a job application"
          disabled={pipeline.phase === "running"}
          className="h-12 w-full rounded-control border border-line bg-surface pl-10 pr-4 text-[0.9375rem] text-ink placeholder:text-ink-subtle transition-colors hover:border-line-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:opacity-60"
        />
      </div>

      {/* The interpretation swaps in as soon as we understand the sentence —
          the fastest possible signal that the product is actually reading it. */}
      <AnimatePresence mode="wait" initial={false}>
        {summary ? (
          <motion.p
            key="summary"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-ink-muted"
          >
            <span>We read that as</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 font-medium text-brand-ink">
              <Icon name="check" className="size-3.5" />
              {summary}
            </span>
          </motion.p>
        ) : (
          <motion.div
            key="examples"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setOutcome(example)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-[0.75rem] font-medium text-ink-muted transition-colors hover:border-line-strong hover:bg-surface-muted hover:text-ink"
              >
                {example}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5">
        <TaskSurface
          pipeline={pipeline}
          emptyPlanMessage="Tell us the outcome above and we will build the plan — for example “under 2 MB as a JPG”."
        />
      </div>
    </Card>
  );
}
