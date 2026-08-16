/**
 * Exact Requirement Mode.
 *
 * A Requirement is a machine-checkable statement of what the destination will
 * accept ("PDF, at most 2 MB"). It is the contract the whole product turns on:
 * the planner works backwards from it, and the success screen proves the output
 * satisfies it rather than just claiming "Done" (plan.md §4.5).
 *
 * Nothing here executes an operation. This is the specification layer.
 */

import { formatBytes } from "@/lib/format";

export type TargetFormat = "pdf" | "jpg" | "png" | "webp";

export const FORMAT_LABELS: Record<TargetFormat, string> = {
  pdf: "PDF",
  jpg: "JPG",
  png: "PNG",
  webp: "WebP",
};

export type Requirement = {
  /** Destination will only accept this container/format. */
  format?: TargetFormat;
  maxBytes?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  exactWidth?: number;
  exactHeight?: number;
  /** Destination is public, so identifying metadata must be removed. */
  stripMetadata?: boolean;
};

/** What we measured about a produced file. `null` means "not determined". */
export type OutputFacts = {
  bytes: number | null;
  format: TargetFormat | null;
  width: number | null;
  height: number | null;
  metadataStripped: boolean | null;
};

export type CheckStatus = "pass" | "fail" | "unknown";

export type RequirementCheck = {
  id: string;
  label: string;
  required: string;
  actual: string;
  status: CheckStatus;
};

export function isEmptyRequirement(requirement: Requirement): boolean {
  return Object.values(requirement).every((value) => value === undefined);
}

/** One-line human summary, e.g. "PDF · max 2 MB". */
export function describeRequirement(requirement: Requirement): string {
  const parts: string[] = [];

  if (requirement.format) parts.push(FORMAT_LABELS[requirement.format]);
  if (requirement.maxBytes) parts.push(`max ${formatBytes(requirement.maxBytes, 0)}`);

  if (requirement.exactWidth && requirement.exactHeight) {
    parts.push(`${requirement.exactWidth}×${requirement.exactHeight}`);
  } else {
    if (requirement.minWidth || requirement.minHeight) {
      parts.push(`min ${requirement.minWidth ?? "?"}×${requirement.minHeight ?? "?"}`);
    }
    if (requirement.maxWidth || requirement.maxHeight) {
      parts.push(`max ${requirement.maxWidth ?? "?"}×${requirement.maxHeight ?? "?"}`);
    }
  }

  if (requirement.stripMetadata) parts.push("metadata removed");

  return parts.join(" · ");
}

/**
 * Produces one check per stated constraint.
 *
 * A constraint we could not measure returns `unknown`, never `pass`. Reporting
 * an unverified requirement as PASSED is the exact failure this feature exists
 * to prevent — the user would submit the file and be rejected anyway.
 */
export function evaluateRequirement(
  requirement: Requirement,
  facts: OutputFacts,
): RequirementCheck[] {
  const checks: RequirementCheck[] = [];

  if (requirement.format) {
    const expected = FORMAT_LABELS[requirement.format];
    checks.push({
      id: "format",
      label: "File format",
      required: expected,
      actual: facts.format ? FORMAT_LABELS[facts.format] : "Not determined",
      status:
        facts.format === null ? "unknown" : facts.format === requirement.format ? "pass" : "fail",
    });
  }

  if (requirement.maxBytes !== undefined) {
    const { maxBytes } = requirement;
    checks.push({
      id: "max-size",
      label: "File size",
      required: `at most ${formatBytes(maxBytes)}`,
      actual: facts.bytes === null ? "Not determined" : formatBytes(facts.bytes),
      status:
        facts.bytes === null ? "unknown" : facts.bytes <= maxBytes ? "pass" : "fail",
    });
  }

  const haveDimensions = facts.width !== null && facts.height !== null;
  const actualDimensions = haveDimensions
    ? `${facts.width}×${facts.height}`
    : "Not determined";

  if (requirement.exactWidth !== undefined && requirement.exactHeight !== undefined) {
    checks.push({
      id: "exact-dimensions",
      label: "Dimensions",
      required: `${requirement.exactWidth}×${requirement.exactHeight}`,
      actual: actualDimensions,
      status: !haveDimensions
        ? "unknown"
        : facts.width === requirement.exactWidth && facts.height === requirement.exactHeight
          ? "pass"
          : "fail",
    });
  } else {
    if (requirement.minWidth !== undefined || requirement.minHeight !== undefined) {
      const minWidth = requirement.minWidth ?? 0;
      const minHeight = requirement.minHeight ?? 0;
      checks.push({
        id: "min-dimensions",
        label: "Minimum dimensions",
        required: `${minWidth || "any"}×${minHeight || "any"} or larger`,
        actual: actualDimensions,
        status: !haveDimensions
          ? "unknown"
          : (facts.width ?? 0) >= minWidth && (facts.height ?? 0) >= minHeight
            ? "pass"
            : "fail",
      });
    }

    if (requirement.maxWidth !== undefined || requirement.maxHeight !== undefined) {
      const maxWidth = requirement.maxWidth ?? Number.POSITIVE_INFINITY;
      const maxHeight = requirement.maxHeight ?? Number.POSITIVE_INFINITY;
      checks.push({
        id: "max-dimensions",
        label: "Maximum dimensions",
        required: `${Number.isFinite(maxWidth) ? maxWidth : "any"}×${
          Number.isFinite(maxHeight) ? maxHeight : "any"
        } or smaller`,
        actual: actualDimensions,
        status: !haveDimensions
          ? "unknown"
          : (facts.width ?? 0) <= maxWidth && (facts.height ?? 0) <= maxHeight
            ? "pass"
            : "fail",
      });
    }
  }

  if (requirement.stripMetadata) {
    checks.push({
      id: "metadata",
      label: "Private metadata",
      required: "removed",
      actual:
        facts.metadataStripped === null
          ? "Not determined"
          : facts.metadataStripped
            ? "Removed"
            : "Still present",
      status:
        facts.metadataStripped === null
          ? "unknown"
          : facts.metadataStripped
            ? "pass"
            : "fail",
    });
  }

  return checks;
}

/** Overall verdict. Anything unproven blocks a PASS. */
export function overallStatus(checks: readonly RequirementCheck[]): CheckStatus {
  if (checks.length === 0) return "unknown";
  if (checks.some((check) => check.status === "fail")) return "fail";
  if (checks.some((check) => check.status === "unknown")) return "unknown";
  return "pass";
}
