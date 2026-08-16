/**
 * Main-thread client for the pipeline worker.
 *
 * Owns the worker lifecycle so callers deal in promises and an AbortSignal
 * rather than message plumbing. One worker per run, terminated on completion —
 * pipelines are short and a pool would keep decoded rasters alive between jobs.
 */

import {
  overallPercent,
  type DoneMessage,
  type ExecStep,
  type ProgressMessage,
  type WorkerResponse,
} from "@/lib/ops/protocol";

export type PipelineProgress = {
  /** 0–100 across the whole chain. */
  percent: number;
  /** Human step name, e.g. "Compressing". */
  label: string;
  stepIndex: number;
  stepCount: number;
};

export type PipelineResult = Omit<DoneMessage, "type" | "jobId">;

export class PipelineCancelled extends Error {
  constructor() {
    super("Cancelled");
    this.name = "PipelineCancelled";
  }
}

export class PipelineFailed extends Error {}

let jobCounter = 0;

/**
 * `files` order is significant — a merge produces pages in this sequence.
 * Without a leading combiner step only the first file is used.
 */
export function runPipeline(
  files: File[],
  steps: ExecStep[],
  options: {
    onProgress?: (progress: PipelineProgress) => void;
    signal?: AbortSignal;
  } = {},
): Promise<PipelineResult> {
  const { onProgress, signal } = options;

  return new Promise<PipelineResult>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new PipelineCancelled());
      return;
    }

    jobCounter += 1;
    const jobId = `job-${jobCounter}`;

    const worker = new Worker(
      new URL("../../workers/pipeline.worker.ts", import.meta.url),
      { type: "module" },
    );

    const cleanup = () => {
      signal?.removeEventListener("abort", onAbort);
      worker.terminate();
    };

    function onAbort() {
      // Ask the worker to stop at its next checkpoint so it can unwind
      // cleanly; terminate() happens once it acknowledges, or on cleanup.
      worker.postMessage({ type: "cancel", jobId });
      cleanup();
      reject(new PipelineCancelled());
    }

    signal?.addEventListener("abort", onAbort, { once: true });

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.jobId !== jobId) return;

      switch (message.type) {
        case "progress":
          onProgress?.(toProgress(message));
          break;

        case "done":
          cleanup();
          resolve({
            blob: message.blob,
            filename: message.filename,
            format: message.format,
            width: message.width,
            height: message.height,
            metadataStripped: message.metadataStripped,
          });
          break;

        case "cancelled":
          cleanup();
          reject(new PipelineCancelled());
          break;

        case "failed":
          cleanup();
          reject(new PipelineFailed(message.message));
          break;
      }
    };

    worker.onerror = () => {
      cleanup();
      reject(new PipelineFailed("The processing engine could not start."));
    };

    worker.postMessage({ type: "run", jobId, files, steps });
  });
}

function toProgress(message: ProgressMessage): PipelineProgress {
  return {
    percent: overallPercent(message),
    label: message.label,
    stepIndex: message.stepIndex,
    stepCount: message.stepCount,
  };
}
