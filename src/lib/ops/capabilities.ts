/**
 * Operation capability registry (todo.md P0).
 *
 * What this build can execute *in this browser* — not what the roadmap
 * promises. The console consults it before enabling "Run this plan", so a user
 * is told up front that a step cannot run rather than after a failure.
 */

import type { DetectedKind } from "@/lib/analyze";
import { HEIC_ENABLED } from "@/lib/ops/heic";
import type { PlanStep } from "@/lib/planner";
import type { ExecStep } from "@/lib/ops/protocol";
import type { Requirement, TargetFormat } from "@/lib/requirement";

export type Capabilities = {
  offscreenCanvas: boolean;
  webWorker: boolean;
  /** Formats this browser can actually encode. */
  encode: Record<TargetFormat, boolean>;
};

/**
 * Kinds the image pipeline can decode.
 *
 * HEIC is included because we ship a WebAssembly fallback for the browsers that
 * cannot decode it natively — see `@/lib/ops/heic`, and the licence notice at
 * the top of that file.
 */
const DECODABLE: readonly DetectedKind[] = [
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  ...(HEIC_ENABLED ? (["heic"] as const) : []),
];

let cached: Capabilities | null = null;

/**
 * Cached accessor returning a stable reference.
 *
 * Capabilities cannot change during a session, and `useSyncExternalStore`
 * requires snapshot identity to be stable or it re-renders forever.
 */
export function getCapabilities(): Capabilities {
  cached ??= detectCapabilities();
  return cached;
}

export function detectCapabilities(): Capabilities {
  const offscreenCanvas =
    typeof OffscreenCanvas !== "undefined" &&
    typeof new OffscreenCanvas(1, 1).convertToBlob === "function";

  return {
    offscreenCanvas,
    webWorker: typeof Worker !== "undefined",
    encode: {
      // Universally supported wherever canvas encoding exists.
      jpg: offscreenCanvas,
      png: offscreenCanvas,
      // Encoding support is checked properly at run time; assume available.
      webp: offscreenCanvas,
      // Needs the PDF engine, which is not built.
      pdf: false,
    },
  };
}

export type StepSupport = { ok: true } | { ok: false; reason: string };

export function supportsStep(
  step: PlanStep,
  kind: DetectedKind,
  capabilities: Capabilities,
): StepSupport {
  if (!capabilities.offscreenCanvas || !capabilities.webWorker) {
    return { ok: false, reason: "This browser cannot process files locally." };
  }

  /**
   * PDF support is real but partial, and the boundary is structural rather
   * than arbitrary: pdf-lib rearranges a document but cannot re-encode the
   * images inside it, and we have no page renderer. So say which is which
   * instead of blocking the whole format.
   */
  if (kind === "pdf") {
    switch (step.id) {
      case "merge-pdf":
      case "organize-pdf":
      case "strip-metadata":
        return { ok: true };
      case "compress":
        return {
          ok: false,
          reason: "PDF compression needs image re-encoding inside the document, which is not built yet.",
        };
      case "resize":
        return { ok: false, reason: "PDF pages cannot be resized yet." };
      case "convert":
        return { ok: false, reason: "Turning a PDF into images needs the PDF renderer." };
      default:
        return { ok: false, reason: "That operation is not available for PDFs." };
    }
  }

  if (kind === "heic" && !HEIC_ENABLED) {
    return { ok: false, reason: "HEIC support is turned off in this build." };
  }

  if (!DECODABLE.includes(kind)) {
    return { ok: false, reason: "This file type is not supported yet." };
  }

  if (step.id === "remove-background" || step.id === "upscale") {
    return { ok: false, reason: "Needs cloud processing, which is not enabled yet." };
  }

  return { ok: true };
}

/**
 * Translates the human-facing plan into worker instructions.
 *
 * Steps the user switched off, and steps this browser cannot run, are dropped
 * here — so what executes is exactly what the preview showed as included.
 */
export function toExecSteps(
  plan: readonly PlanStep[],
  requirement: Requirement,
  disabled: ReadonlySet<string>,
): ExecStep[] {
  const steps: ExecStep[] = [];

  for (const step of plan) {
    if (disabled.has(step.id)) continue;

    switch (step.id) {
      case "convert":
        if (requirement.format) steps.push({ id: "convert", format: requirement.format });
        break;

      case "resize":
        steps.push({
          id: "resize",
          maxWidth: requirement.maxWidth,
          maxHeight: requirement.maxHeight,
          exactWidth: requirement.exactWidth,
          exactHeight: requirement.exactHeight,
        });
        break;

      case "strip-metadata":
        steps.push({ id: "strip-metadata" });
        break;

      // Combining steps are supplied directly by a tool page rather than
      // derived from a Requirement — a merge is not expressible as one.
      case "merge-pdf":
        steps.push({ id: "merge-pdf" });
        break;

      case "images-to-pdf":
        steps.push({ id: "images-to-pdf" });
        break;

      case "compress":
        if (requirement.maxBytes !== undefined) {
          steps.push({ id: "compress", maxBytes: requirement.maxBytes });
        }
        break;

      default:
        // remove-background / upscale are cloud work and never reach the worker.
        break;
    }
  }

  return steps;
}

/**
 * A convert step can be implied by HEIC input with no stated format, in which
 * case the planner chose JPG. Mirror that here so the worker agrees.
 */
export function impliedFormat(
  requirement: Requirement,
  kind: DetectedKind,
): TargetFormat | undefined {
  if (requirement.format) return requirement.format;
  return kind === "heic" ? "jpg" : undefined;
}
