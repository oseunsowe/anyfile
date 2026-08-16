/**
 * The contract between the main thread and the pipeline worker.
 *
 * Kept free of DOM and worker globals so both sides — and the tests — can
 * import it. `PlanStep` (from the planner) describes intent for a human;
 * `ExecStep` is the same decision reduced to parameters a worker can execute.
 */

import type { TargetFormat } from "@/lib/requirement";

export type ExecStep =
  | { id: "convert"; format: TargetFormat }
  | {
      id: "resize";
      maxWidth?: number;
      maxHeight?: number;
      exactWidth?: number;
      exactHeight?: number;
    }
  | { id: "strip-metadata" }
  | { id: "compress"; maxBytes: number }
  // Combining steps consume every input file and produce one. They are only
  // valid as the first step — see `isCombiner` below.
  | { id: "merge-pdf" }
  | { id: "images-to-pdf" }
  | { id: "organize-pdf"; keep?: number[]; rotate?: Record<number, number> };

export type ExecStepId = ExecStep["id"];

const COMBINERS = new Set<ExecStepId>(["merge-pdf", "images-to-pdf"]);

/**
 * True for steps that fold many inputs into one.
 *
 * The pipeline is single-file from step two onward, so a combiner is only
 * meaningful at the head of the chain. Everything after it operates on the one
 * document it produced.
 */
export function isCombiner(step: ExecStep): boolean {
  return COMBINERS.has(step.id);
}

export const MIME_BY_FORMAT: Record<TargetFormat, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

export const EXTENSION_BY_FORMAT: Record<TargetFormat, string> = {
  jpg: "jpg",
  png: "png",
  webp: "webp",
  pdf: "pdf",
};

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export type WorkerRequest =
  /**
   * `files` is ordered and significant: a merge produces pages in exactly this
   * sequence. Without a leading combiner step, only the first file is used.
   */
  | { type: "run"; jobId: string; files: File[]; steps: ExecStep[] }
  /** Cooperative cancellation — the worker checks between and inside steps. */
  | { type: "cancel"; jobId: string };

/** Determinate progress only. §4.4 forbids inventing a percentage. */
export type ProgressMessage = {
  type: "progress";
  jobId: string;
  stepIndex: number;
  stepCount: number;
  stepId: ExecStepId;
  label: string;
  /** 0–100 within the current step. */
  percent: number;
};

export type DoneMessage = {
  type: "done";
  jobId: string;
  blob: Blob;
  filename: string;
  format: TargetFormat | null;
  width: number | null;
  height: number | null;
  /** True only when the bytes were re-encoded, which drops all metadata. */
  metadataStripped: boolean;
};

export type FailedMessage = {
  type: "failed";
  jobId: string;
  /** Plain language, shown directly to the user (§12 error recovery). */
  message: string;
  stepId?: ExecStepId;
};

export type CancelledMessage = { type: "cancelled"; jobId: string };

export type WorkerResponse =
  | ProgressMessage
  | DoneMessage
  | FailedMessage
  | CancelledMessage;

/** Overall progress across the whole chain, for a single bar. */
export function overallPercent(message: ProgressMessage): number {
  const completed = message.stepIndex / message.stepCount;
  const withinStep = message.percent / 100 / message.stepCount;
  return Math.round((completed + withinStep) * 100);
}
