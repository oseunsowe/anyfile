"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { EASE } from "@/components/motion/Reveal";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * The ordered input queue for combining tools.
 *
 * This is the merge tool's teaching surface (todo.md: "PDF merge: teach through
 * drag-to-order interaction"). Order is shown as an explicit numbered list
 * because it is the one thing that changes the output, and it is edited with
 * buttons rather than drag alone — drag is unusable by keyboard, awkward on
 * touch, and impossible to discover from a static screenshot.
 */
export function FileQueue({
  files,
  onRemove,
  onMove,
  disabled = false,
  className,
}: {
  files: readonly File[];
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  disabled?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (files.length === 0) return null;

  const total = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.8125rem] font-medium text-ink">
          {files.length} {files.length === 1 ? "file" : "files"}, in this order
        </p>
        <p className="font-mono text-[0.75rem] text-ink-subtle">{formatBytes(total)}</p>
      </div>

      <ol className="mt-2.5 space-y-px overflow-hidden rounded-card border border-line">
        <AnimatePresence initial={false}>
          {files.map((file, index) => (
            <motion.li
              key={`${file.name}-${file.size}-${index}`}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              className={cn(
                "flex items-center gap-3 bg-surface p-3",
                index > 0 && "border-t border-line",
              )}
            >
              <span
                aria-hidden="true"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-[0.6875rem] font-semibold text-brand-ink"
              >
                {index + 1}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.8125rem] font-medium text-ink">
                  {file.name}
                </span>
                <span className="font-mono text-[0.75rem] text-ink-subtle">
                  {formatBytes(file.size)}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-0.5">
                <QueueButton
                  label={`Move ${file.name} earlier`}
                  icon="caretUp"
                  disabled={disabled || index === 0}
                  onClick={() => onMove(index, -1)}
                />
                <QueueButton
                  label={`Move ${file.name} later`}
                  icon="caretDown"
                  disabled={disabled || index === files.length - 1}
                  onClick={() => onMove(index, 1)}
                />
                <QueueButton
                  label={`Remove ${file.name}`}
                  icon="close"
                  disabled={disabled}
                  onClick={() => onRemove(index)}
                />
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  );
}

function QueueButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: "caretUp" | "caretDown" | "close";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // 36px keeps the touch target usable without bloating the row (§12).
      className="inline-flex size-9 items-center justify-center rounded-control text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon name={icon} className="size-4" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
