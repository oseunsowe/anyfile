/**
 * Operation capability registry (todo.md P0).
 *
 * What this build can execute *in this browser* — not what the roadmap
 * promises. The console consults it before enabling "Run this plan", so a user
 * is told up front that a step cannot run rather than after a failure.
 */

import type { DetectedKind } from "@/lib/analyze";
import type { Entitlements } from "@/lib/entitlements";
import { CLOUD_AI_ENABLED } from "@/lib/featureFlags";
import { HEIC_ENABLED } from "@/lib/ops/heic";
import { isPaidPlan } from "@/lib/plans";
import type { PlanStep } from "@/lib/planner";
import type { ExecStep, LeadOperation } from "@/lib/ops/protocol";
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

export type StepSupport =
  | { ok: true }
  | { ok: false; reason: string; cta?: { label: string; href: string } };

export function supportsStep(
  step: PlanStep,
  kind: DetectedKind,
  capabilities: Capabilities,
  entitlements?: Entitlements,
): StepSupport {
  if (!capabilities.offscreenCanvas || !capabilities.webWorker) {
    return { ok: false, reason: "This browser cannot process files locally." };
  }

  /**
   * PDF support is real but partial. "compress" recompresses the embedded
   * photos a page draws rather than the page itself, so it needs no
   * renderer. "pdf-to-images" (PDF to JPG's dedicated lead operation, see
   * ops/pdfRender.ts) does rasterize pages — but only that one path; the
   * generic "convert" a Requirement can ask for is not wired to it, so it
   * still says no below.
   */
  if (kind === "pdf") {
    switch (step.id) {
      case "merge-pdf":
      case "organize-pdf":
      case "pdf-to-images":
      case "strip-metadata":
      case "compress":
        return { ok: true };
      case "resize":
        return { ok: false, reason: "PDF pages cannot be resized yet." };
      case "rotate":
      case "crop":
        return { ok: false, reason: "Use Organize PDF to rotate or trim PDF pages." };
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

  if (step.id === "remove-background") {
    if (!CLOUD_AI_ENABLED) {
      return { ok: false, reason: "Needs cloud processing, which is not enabled yet." };
    }
    if (!entitlements?.loggedIn) {
      return {
        ok: false,
        reason: "Background removal is a paid feature — sign in on a paid plan to use it.",
        cta: { label: "Sign in", href: "/login" },
      };
    }
    if (!isPaidPlan(entitlements.plan)) {
      return {
        ok: false,
        reason: "Background removal is a paid feature — upgrade your plan to use it.",
        cta: { label: "See plans", href: "/plans" },
      };
    }
    return { ok: true };
  }

  if (step.id === "upscale") {
    return { ok: false, reason: "AI upscaling is not enabled yet." };
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
  lead?: LeadOperation,
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

      case "rotate":
        if (requirement.rotate) steps.push({ id: "rotate", degrees: requirement.rotate });
        break;

      case "crop":
        if (requirement.cropAspect) steps.push({ id: "crop", aspect: requirement.cropAspect });
        break;

      case "watermark":
        if (requirement.watermarkText) {
          steps.push({ id: "watermark", text: requirement.watermarkText });
        }
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

      // keep/rotate come from the page list the user edited, not the Requirement.
      case "organize-pdf":
        steps.push({
          id: "organize-pdf",
          keep: lead?.keep,
          rotate: lead?.rotate,
          rotateAll: lead?.rotateAll,
        });
        break;

      case "compress":
        if (requirement.maxBytes !== undefined) {
          steps.push({ id: "compress", maxBytes: requirement.maxBytes });
        }
        break;

      default:
        // remove-background / upscale are cloud work, and pdf-to-images
        // renders on the main thread (see ops/pdfRender.ts) — none of these
        // ever reach the worker.
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
