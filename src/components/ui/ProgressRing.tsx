"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Determinate progress ring (reference screen 2.2).
 *
 * The arc is driven by `pathLength`, so the geometry stays correct at any size.
 * Like `Progress`, `value` is required — §4.4 forbids fake progress, and a ring
 * that spins without meaning is exactly that.
 */
export function ProgressRing({
  value,
  label,
  sublabel,
  className,
}: {
  /** 0–100. */
  value: number;
  label: string;
  sublabel?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative size-32">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-canvas-alt"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-brand"
            initial={false}
            animate={{ pathLength: clamped / 100 }}
            transition={reduced ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
          />
        </svg>

        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className="font-mono text-2xl font-semibold tabular-nums text-ink">
            {clamped}%
          </span>
        </div>
      </div>

      <p className="mt-4 text-[0.9375rem] font-medium text-ink">{label}</p>
      {sublabel ? (
        <p className="mt-0.5 text-[0.8125rem] text-ink-muted">{sublabel}</p>
      ) : null}
    </div>
  );
}
