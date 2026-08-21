"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileDrop } from "@/components/tools/FileDrop";
import { FileQueue } from "@/components/tools/FileQueue";
import { DiagnosisPanel } from "@/components/tools/DiagnosisPanel";
import { PlanPreview } from "@/components/tools/PlanPreview";
import { ProofPanel } from "@/components/tools/ProofPanel";
import { Button } from "@/components/ui/Button";
import { Icon, Spinner } from "@/components/ui/Icon";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { EASE } from "@/components/motion/Reveal";
import type { useFilePipeline } from "@/lib/useFilePipeline";

type Pipeline = ReturnType<typeof useFilePipeline>;

/**
 * The shared task loop UI: drop → diagnose → plan → run → prove → download.
 *
 * Lives in one place so the homepage console and every tool page behave
 * identically; only the copy and the surrounding controls differ.
 *
 * Phase changes cross-fade rather than cutting, which keeps the panel from
 * jumping as content height changes between steps. `mode="wait"` matters: two
 * phases overlapping would double the height mid-transition.
 */
export function TaskSurface({
  pipeline,
  dropTitle = "Drop a file here",
  dropHint = "or paste from your clipboard · nothing is uploaded",
  accept,
  runLabel = "Run this plan",
  /** Combining tools (merge, image-to-pdf) take an ordered queue rather than one file. */
  multiple = false,
  emptyPlanMessage,
  children,
}: {
  pipeline: Pipeline;
  dropTitle?: string;
  dropHint?: string;
  accept?: string;
  runLabel?: string;
  multiple?: boolean;
  /** Shown when a file is loaded but no work is required. */
  emptyPlanMessage?: ReactNode;
  /** Extra controls rendered above the plan, e.g. a target-size field. */
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const {
    analysis, blockers, canRun, cancel, checks, disabledSteps, downloadUrl,
    error, files, handleFiles, maxInputBytes, moveFile, phase, plan, progress,
    removeFile, reset, result, run, toggleStep,
  } = pipeline;

  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.28, ease: EASE };

  const fade = {
    initial: { opacity: 0, y: reduced ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduced ? 0 : -8 },
    transition,
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {phase === "idle" || phase === "error" ? (
        <motion.div key="input" {...fade}>
          <FileDrop
            onFiles={handleFiles}
            accept={accept}
            multiple={multiple}
            maxBytes={maxInputBytes}
            title={dropTitle}
            hint={dropHint}
          />
          {error ? (
            <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger">
              {error}
            </p>
          ) : null}
          {phase === "error" ? (
            <Button variant="ghost" size="sm" className="mt-2" onClick={reset}>
              <Icon name="restart" className="size-4" />
              Start over
            </Button>
          ) : null}
        </motion.div>
      ) : null}

      {phase === "analyzing" ? (
        <motion.div
          key="analyzing"
          {...fade}
          role="status"
          className="flex items-center gap-2.5 rounded-panel border border-line bg-surface-muted p-8 text-[0.8125rem] text-ink-muted"
        >
          <Spinner className="size-4" label="Reading file" />
          Reading the file on your device…
        </motion.div>
      ) : null}

      {phase === "running" && progress ? (
        <motion.div
          key="running"
          {...fade}
          className="flex flex-col items-center gap-5 rounded-panel border border-line bg-surface-muted p-8"
        >
          <ProgressRing
            value={progress.percent}
            label={progress.label}
            sublabel={`Step ${progress.stepIndex + 1} of ${progress.stepCount}`}
          />
          <Button variant="outline" size="sm" onClick={cancel}>
            Cancel
          </Button>
        </motion.div>
      ) : null}

      {phase === "ready" && analysis ? (
        <motion.div key="ready" {...fade} className="space-y-6">
          {multiple ? (
            <FileQueue files={files} onRemove={removeFile} onMove={moveFile} />
          ) : (
            <DiagnosisPanel
              analysis={analysis}
              mode={
                plan.some(
                  (step) => !disabledSteps.has(step.id) && step.processing === "cloud",
                )
                  ? "cloud"
                  : "device"
              }
            />
          )}

          {multiple ? (
            <FileDrop
              onFiles={handleFiles}
              accept={accept}
              multiple
              maxBytes={maxInputBytes}
              title="Add another file"
              hint="or paste from your clipboard"
            />
          ) : null}

          {children}

          {plan.length > 0 ? (
            <PlanPreview steps={plan} disabledSteps={disabledSteps} onToggleStep={toggleStep} />
          ) : (
            <p className="rounded-card bg-surface-muted p-3.5 text-[0.8125rem] text-ink-muted">
              {emptyPlanMessage ?? "This file already meets the requirement — nothing to do."}
            </p>
          )}

          {blockers.length > 0 ? (
            <ul className="space-y-2 rounded-card bg-warning-soft p-3.5">
              {blockers.map((blocker) => (
                <li key={blocker.id} className="flex items-start gap-2 text-[0.8125rem] text-ink">
                  <Icon name="warning" className="mt-0.5 size-4 text-warning" />
                  <span>
                    <span className="font-medium">{blocker.title}</span> — {blocker.reason}
                    {blocker.cta ? (
                      <>
                        {" "}
                        <Link
                          href={blocker.cta.href}
                          className="font-medium text-brand underline-offset-2 hover:underline"
                        >
                          {blocker.cta.label} →
                        </Link>
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="brand" size="md" disabled={!canRun} onClick={run}>
              {runLabel}
              <Icon name="arrowRight" className="size-4" />
            </Button>
            <Button variant="ghost" size="md" onClick={reset}>
              <Icon name="restart" className="size-4" />
              Start over
            </Button>
          </div>
        </motion.div>
      ) : null}

      {phase === "done" && result && analysis ? (
        <motion.div key="done" {...fade} className="space-y-6">
          <ProofPanel
            checks={checks}
            beforeBytes={analysis.size}
            afterBytes={result.blob.size}
            facts={{
              format: result.format,
              width: result.width,
              height: result.height,
            }}
          />

          <div className="flex flex-wrap items-center gap-3">
            {downloadUrl ? (
              <motion.a
                href={downloadUrl}
                download={result.filename}
                initial={reduced ? false : { scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.12, ...transition }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              >
                <Icon name="download" className="size-4" />
                Download {result.filename}
              </motion.a>
            ) : null}
            <Button variant="ghost" size="md" onClick={reset}>
              <Icon name="restart" className="size-4" />
              Fix another file
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
