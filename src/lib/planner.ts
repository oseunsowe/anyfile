/**
 * Operation planner — the piece that makes AnyFileKits a solution rather than a
 * toolbox (plan.md §Phase 4).
 *
 * Given what a file *is* (diagnosis) and what the destination *demands*
 * (requirement), it produces the ordered chain of operations that closes the
 * gap, with a reason for every step so the plan can be shown before it runs and
 * individual steps switched off (§5).
 *
 * It plans only. Execution arrives with the worker framework.
 */

import type { FileAnalysis, DetectedKind } from "@/lib/analyze";
import type { ActionHint } from "@/lib/intent";
import type { Requirement, TargetFormat } from "@/lib/requirement";
import { FORMAT_LABELS } from "@/lib/requirement";
import { formatBytes } from "@/lib/format";
import { CLOUD_AI_ENABLED } from "@/lib/featureFlags";
import type { ProcessingMode } from "@/lib/tools";

export type PlanStep = {
  id: string;
  title: string;
  /** Why this step is in the plan — shown under the title. */
  reason: string;
  /** Registry slug of the tool that performs it. */
  tool: string;
  processing: ProcessingMode;
  /** Steps the user may switch off without breaking the requirement (§5). */
  optional: boolean;
};

/** Detected kinds that are already a valid output format. */
const KIND_AS_FORMAT: Partial<Record<DetectedKind, TargetFormat>> = {
  pdf: "pdf",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

export function kindToFormat(kind: DetectedKind): TargetFormat | null {
  return KIND_AS_FORMAT[kind] ?? null;
}

export type PlanInput = {
  analysis: FileAnalysis | null;
  requirement: Requirement;
  actions?: readonly ActionHint[];
};

/**
 * Step order is deliberate and load-bearing:
 *   convert → background → resize → strip metadata → compress
 * Compression must run last because the achievable quality depends on the final
 * pixel count and format; compressing first and resizing after throws away
 * quality for nothing.
 */
export function buildPlan({ analysis, requirement, actions = [] }: PlanInput): PlanStep[] {
  const steps: PlanStep[] = [];
  const currentFormat = analysis ? kindToFormat(analysis.kind) : null;
  const isPdf = analysis?.kind === "pdf" || requirement.format === "pdf";

  // HEIC has no valid output format of its own, so it always needs converting.
  const targetFormat: TargetFormat | null =
    requirement.format ?? (analysis?.kind === "heic" ? "jpg" : null);

  const willConvert = targetFormat !== null && currentFormat !== targetFormat;

  if (targetFormat && willConvert) {
    steps.push({
      id: "convert",
      title: `Convert to ${FORMAT_LABELS[targetFormat]}`,
      reason:
        analysis?.kind === "heic"
          ? "HEIC from iPhone is not readable on Windows or most upload forms."
          : `The destination accepts ${FORMAT_LABELS[targetFormat]}.`,
      tool: pickConversionTool(analysis?.kind ?? null, targetFormat),
      processing: "device",
      optional: false,
    });
  }

  if (requirement.rotate) {
    steps.push({
      id: "rotate",
      title: `Rotate ${requirement.rotate}°`,
      reason: "Straightens the photo before anything else runs.",
      tool: "crop-image",
      processing: "device",
      optional: false,
    });
  }

  if (requirement.cropAspect) {
    steps.push({
      id: "crop",
      title: `Crop to ${requirement.cropAspect}`,
      reason: "Trims to the shape you chose, centred on the photo — nothing is stretched.",
      tool: "crop-image",
      processing: "device",
      optional: false,
    });
  }

  if (CLOUD_AI_ENABLED && actions.includes("remove-background")) {
    steps.push({
      id: "remove-background",
      title: "Remove the background",
      // Runs before resize so the cutout is computed at full resolution.
      reason: "Requested, and done before resizing so the edges stay clean.",
      tool: "remove-background",
      processing: "cloud",
      optional: true,
    });
  }

  const resizeStep = planResize(analysis, requirement);
  if (resizeStep) steps.push(resizeStep);

  if (requirement.watermarkText) {
    steps.push({
      id: "watermark",
      title: "Add watermark",
      reason: "Stamped after resizing, so it survives at the final size.",
      tool: "watermark-image",
      processing: "device",
      optional: false,
    });
  }

  const wantsStrip = requirement.stripMetadata || analysis?.hasGpsMetadata === true;
  if (wantsStrip) {
    steps.push({
      id: "strip-metadata",
      title: "Remove private metadata",
      reason:
        analysis?.hasGpsMetadata === true
          ? "This file records where it was taken."
          : "Removes author, device and location data before sharing.",
      tool: isPdf ? "pdf-remove-metadata" : "remove-location-from-photo",
      // Stripping metadata is a privacy gain but never required by a size limit.
      optional: !requirement.stripMetadata,
      processing: "device",
    });
  }

  const compressStep = planCompression(analysis, requirement, isPdf, willConvert);
  if (compressStep) steps.push(compressStep);

  return steps;
}

function planResize(
  analysis: FileAnalysis | null,
  requirement: Requirement,
): PlanStep | null {
  const { exactWidth, exactHeight, minWidth, minHeight, maxWidth, maxHeight } = requirement;

  if (exactWidth !== undefined && exactHeight !== undefined) {
    const alreadyCorrect =
      analysis?.width === exactWidth && analysis?.height === exactHeight;
    if (alreadyCorrect) return null;

    return {
      id: "resize",
      title: `Resize to ${exactWidth}×${exactHeight}`,
      reason: "The destination expects these exact dimensions.",
      tool: "resize-image",
      processing: "device",
      optional: false,
    };
  }

  const tooLarge =
    (maxWidth !== undefined && (analysis?.width ?? 0) > maxWidth) ||
    (maxHeight !== undefined && (analysis?.height ?? 0) > maxHeight);

  if (tooLarge) {
    return {
      id: "resize",
      title: `Resize to fit ${maxWidth ?? "any"}×${maxHeight ?? "any"}`,
      reason: "The image is larger than the destination allows.",
      tool: "resize-image",
      processing: "device",
      optional: false,
    };
  }

  const tooSmall =
    (minWidth !== undefined && analysis?.width !== null && (analysis?.width ?? 0) < minWidth) ||
    (minHeight !== undefined && analysis?.height !== null && (analysis?.height ?? 0) < minHeight);

  if (tooSmall && CLOUD_AI_ENABLED) {
    return {
      id: "upscale",
      title: "Upscale to meet the minimum size",
      // Honest framing: enlarging cannot recover detail that was never captured.
      reason:
        "The image is below the required minimum. Upscaling adds pixels but cannot add real detail.",
      tool: "resize-image",
      processing: "cloud",
      optional: false,
    };
  }

  return null;
}

function planCompression(
  analysis: FileAnalysis | null,
  requirement: Requirement,
  isPdf: boolean,
  willConvert: boolean,
): PlanStep | null {
  if (requirement.maxBytes === undefined) return null;

  // Already under the limit, and nothing upstream will inflate it again. A
  // re-encode can grow a file (PNG especially), so a planned conversion keeps
  // the compression step even when the input already fits.
  if (analysis && analysis.size <= requirement.maxBytes && !willConvert) {
    return null;
  }

  return {
    id: "compress",
    title: `Compress to ${formatBytes(requirement.maxBytes, 0)} or less`,
    reason: "Runs last, at the highest quality that still meets the limit.",
    tool: isPdf ? "compress-pdf-under-2mb" : "image-under-2mb",
    processing: "device",
    optional: false,
  };
}

function pickConversionTool(from: DetectedKind | null, to: TargetFormat): string {
  if (from === "heic") return "heic-to-jpg";
  if (to === "pdf") return "image-to-pdf";
  if (from === "pdf") return "pdf-to-jpg";
  if (to === "png") return "jpg-to-png";
  if (to === "webp") return "webp-converter";
  if (from === "png") return "png-to-jpg";
  return "compress-image";
}
