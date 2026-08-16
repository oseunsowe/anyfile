/// <reference lib="webworker" />

/**
 * Operation chaining engine (todo.md P0 "Processing Framework").
 *
 * Runs the planned steps in order, off the main thread, so a large file never
 * blocks scrolling or the cancel button. Each step consumes the previous step's
 * output, which is what makes SmartFix a chain rather than a single tool.
 *
 * Steps dispatch on the *current* file type, not on the original input: after an
 * images-to-pdf step the document is a PDF, so a following strip-metadata must
 * take the PDF path. Keeping that decision in one place is what lets the planner
 * stay format-agnostic.
 */

import {
  compressToTarget,
  decodeImage,
  encodeImage,
  resizeImage,
} from "@/lib/ops/image";
import { OperationError } from "@/lib/ops/errors";
import { imagesToPdf, mergePdfs, organizePdf, stripPdfMetadata } from "@/lib/ops/pdf";
import { CancelledError } from "@/lib/ops/quality";
import {
  EXTENSION_BY_FORMAT,
  isCombiner,
  MIME_BY_FORMAT,
  type ExecStep,
  type WorkerRequest,
  type WorkerResponse,
} from "@/lib/ops/protocol";
import type { TargetFormat } from "@/lib/requirement";

declare const self: DedicatedWorkerGlobalScope;

const cancelled = new Set<string>();

function post(message: WorkerResponse) {
  self.postMessage(message);
}

const STEP_LABELS: Record<ExecStep["id"], string> = {
  convert: "Converting",
  resize: "Resizing",
  "strip-metadata": "Removing metadata",
  compress: "Compressing",
  "merge-pdf": "Merging",
  "images-to-pdf": "Building PDF",
  "organize-pdf": "Reordering pages",
};

const PDF_MIME = "application/pdf";

function formatFromMime(mime: string): TargetFormat | null {
  const entry = Object.entries(MIME_BY_FORMAT).find(([, value]) => value === mime);
  return entry ? (entry[0] as TargetFormat) : null;
}

function renameTo(filename: string, format: TargetFormat): string {
  const dot = filename.lastIndexOf(".");
  const stem = dot === -1 ? filename : filename.slice(0, dot);
  return `${stem}.${EXTENSION_BY_FORMAT[format]}`;
}

/** pdf-lib embeds JPEG and PNG only; anything else is re-encoded to JPEG. */
async function toEmbeddable(file: File) {
  const mime = file.type;
  if (mime === "image/jpeg" || mime === "image/png") {
    return { bytes: new Uint8Array(await file.arrayBuffer()), mime };
  }

  const bitmap = await decodeImage(file);
  try {
    const jpeg = await encodeImage(bitmap, "image/jpeg", 0.92);
    return { bytes: new Uint8Array(await jpeg.arrayBuffer()), mime: "image/jpeg" };
  } finally {
    bitmap.close();
  }
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  if (request.type === "cancel") {
    cancelled.add(request.jobId);
    return;
  }

  const { jobId, files, steps } = request;
  const isCancelled = () => cancelled.has(jobId);

  if (files.length === 0) {
    post({ type: "failed", jobId, message: "No file was provided." });
    return;
  }

  // State of the document as it moves along the chain.
  let current: Blob = files[0];
  let filename = files[0].name;
  let mime = files[0].type || "application/octet-stream";
  let width: number | null = null;
  let height: number | null = null;
  let reEncoded = false;

  try {
    for (const [index, step] of steps.entries()) {
      if (isCancelled()) throw new CancelledError();

      const report = (percent: number) =>
        post({
          type: "progress",
          jobId,
          stepIndex: index,
          stepCount: steps.length,
          stepId: step.id,
          label: STEP_LABELS[step.id],
          percent,
        });

      report(0);

      if (isCombiner(step) && index > 0) {
        throw new OperationError("Files can only be combined as the first step.");
      }

      switch (step.id) {
        case "merge-pdf": {
          current = await mergePdfs(
            files.map((file) => ({ blob: file, name: file.name })),
            report,
          );
          mime = PDF_MIME;
          filename = files.length > 1 ? "merged.pdf" : renameTo(filename, "pdf");
          reEncoded = true;
          break;
        }

        case "images-to-pdf": {
          const embeddable = [];
          for (const [position, file] of files.entries()) {
            if (isCancelled()) throw new CancelledError();
            embeddable.push(await toEmbeddable(file));
            // Half the bar is conversion, half is assembling the document.
            report(Math.round(((position + 1) / files.length) * 50));
          }
          current = await imagesToPdf(embeddable, (percent) =>
            report(50 + Math.round(percent / 2)),
          );
          mime = PDF_MIME;
          filename = files.length > 1 ? "images.pdf" : renameTo(filename, "pdf");
          reEncoded = true;
          break;
        }

        case "organize-pdf": {
          current = await organizePdf(current, { keep: step.keep, rotate: step.rotate });
          reEncoded = true;
          break;
        }

        case "strip-metadata": {
          if (mime === PDF_MIME) {
            current = await stripPdfMetadata(current);
          } else {
            // A canvas round trip carries pixels only, so this is the removal.
            const bitmap = await decodeImage(current);
            try {
              current = await encodeImage(bitmap, mime, 0.95);
            } finally {
              bitmap.close();
            }
          }
          reEncoded = true;
          break;
        }

        case "convert": {
          const targetMime = MIME_BY_FORMAT[step.format];

          if (targetMime === PDF_MIME) {
            const embeddable = [await toEmbeddable(files[0])];
            current = await imagesToPdf(embeddable, report);
          } else if (mime === PDF_MIME) {
            throw new OperationError(
              "Turning a PDF into an image needs the PDF renderer, which is not built yet.",
            );
          } else {
            const bitmap = await decodeImage(current);
            try {
              current = await encodeImage(bitmap, targetMime, 0.92);
            } finally {
              bitmap.close();
            }
          }

          mime = targetMime;
          filename = renameTo(filename, step.format);
          reEncoded = true;
          break;
        }

        case "resize":
        case "compress": {
          if (mime === PDF_MIME) {
            throw new OperationError(
              step.id === "compress"
                ? "PDF compression is not available yet — it needs image re-encoding inside the document."
                : "PDF pages cannot be resized yet.",
            );
          }

          // Decoded per step: the previous step produced new bytes, and holding
          // one bitmap across the chain would compound resampling error.
          const bitmap = await decodeImage(current);
          try {
            if (step.id === "resize") {
              const resized = await resizeImage(bitmap, step, mime);
              if (resized) {
                current = resized.blob;
                reEncoded = true;
              }
            } else {
              const result = await compressToTarget(bitmap, mime, step.maxBytes, {
                onProgress: report,
                isCancelled,
              });
              current = result.blob;
              reEncoded = true;
              // metTarget is intentionally not an error. The proof screen checks
              // the real bytes and shows an honest FAIL.
            }
          } finally {
            bitmap.close();
          }
          break;
        }
      }

      report(100);
    }

    if (isCancelled()) throw new CancelledError();

    // Measure the actual output rather than assuming the plan worked.
    if (mime !== PDF_MIME) {
      try {
        const finalBitmap = await decodeImage(current);
        width = finalBitmap.width;
        height = finalBitmap.height;
        finalBitmap.close();
      } catch {
        // Leave null; the proof panel reports "Not determined".
      }
    }

    post({
      type: "done",
      jobId,
      blob: current,
      filename,
      format: formatFromMime(mime),
      width,
      height,
      metadataStripped: reEncoded,
    });
  } catch (error) {
    if (error instanceof CancelledError || isCancelled()) {
      post({ type: "cancelled", jobId });
    } else {
      post({
        type: "failed",
        jobId,
        message:
          error instanceof OperationError
            ? error.message
            : "Something went wrong while processing this file.",
      });
    }
  } finally {
    cancelled.delete(jobId);
  }
};

export {};
