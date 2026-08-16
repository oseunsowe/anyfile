/**
 * Deterministic intent router (plan.md §"AI/ML": rules first, model second).
 *
 * Turns plain English — "make this resume under 2MB for a job application" —
 * into a machine-checkable Requirement plus the actions the user implied. This
 * is pure, synchronous and testable, and it handles the overwhelming majority
 * of phrasings without a model call. An LLM fallback belongs behind
 * `confidence === "none"`, not in front of it.
 */

import type { Requirement, TargetFormat } from "@/lib/requirement";

export type ActionHint =
  | "convert"
  | "compress"
  | "resize"
  | "strip-metadata"
  | "remove-background"
  | "merge"
  | "split"
  | "ocr";

export type ParsedIntent = {
  requirement: Requirement;
  actions: ActionHint[];
  /** Workflow id when a destination was named, e.g. "email" or "etsy". */
  destination: string | null;
  /** Which fragments of the input we actually understood. */
  matched: string[];
  confidence: "high" | "low" | "none";
};

const SIZE_UNITS: Record<string, number> = {
  b: 1,
  byte: 1,
  bytes: 1,
  k: 1_000,
  kb: 1_000,
  m: 1_000_000,
  mb: 1_000_000,
  g: 1_000_000_000,
  gb: 1_000_000_000,
};

/** "under 2 MB", "≤500kb", "max 1.5 mb", or a bare "2mb". */
const SIZE_PATTERN =
  /(?:under|below|less than|smaller than|no (?:more|larger|bigger) than|max(?:imum)?|at most|<=?|≤)?\s*(\d+(?:\.\d+)?)\s*(bytes?|kb|mb|gb|[bkmg])\b/i;

const DIMENSION_PATTERN = /(\d{2,5})\s*(?:x|×|by)\s*(\d{2,5})/i;

const FORMAT_PATTERN = /\b(pdf|jpe?g|png|webp)\b/i;

const DESTINATIONS: readonly { id: string; pattern: RegExp }[] = [
  { id: "job-application", pattern: /\b(job|application|portal|resume|cv|recruit)\w*/i },
  { id: "email", pattern: /\b(e-?mail|gmail|outlook|attach\w*)\b/i },
  { id: "etsy", pattern: /\betsy\b/i },
  { id: "amazon", pattern: /\bamazon\b/i },
  { id: "linkedin", pattern: /\blinked-?in\b/i },
  { id: "youtube", pattern: /\byou-?tube|thumbnail\b/i },
  { id: "web", pattern: /\b(web ?site|web ?page|on the web|web-?ready)\b/i },
  { id: "print", pattern: /\bprint\w*\b/i },
  { id: "privacy-clean", pattern: /\b(privacy|anonym\w*|strip|scrub)\b/i },
];

const ACTION_PATTERNS: readonly { action: ActionHint; pattern: RegExp }[] = [
  { action: "compress", pattern: /\b(compress|shrink|reduce|smaller|slim)\w*/i },
  { action: "resize", pattern: /\b(resize|scale|dimensions?|crop|fit)\w*/i },
  { action: "convert", pattern: /\b(convert|change|turn (?:it )?into|export as)\b/i },
  {
    action: "strip-metadata",
    pattern: /\b(gps|location|exif|metadata|geotag)\w*/i,
  },
  {
    action: "remove-background",
    pattern: /\b(remove|delete|cut ?out|erase)\s+(?:the\s+)?background|\btransparent\b/i,
  },
  { action: "merge", pattern: /\b(merge|combine|join)\b/i },
  { action: "split", pattern: /\b(split|separate|extract pages?)\b/i },
  { action: "ocr", pattern: /\b(ocr|searchable|scanned?|text from)\b/i },
];

export function parseIntent(input: string): ParsedIntent {
  const text = input.trim();
  const requirement: Requirement = {};
  const actions: ActionHint[] = [];
  const matched: string[] = [];

  if (text.length === 0) {
    return { requirement, actions, destination: null, matched, confidence: "none" };
  }

  const sizeMatch = SIZE_PATTERN.exec(text);
  if (sizeMatch) {
    const amount = Number.parseFloat(sizeMatch[1]);
    const unit = SIZE_UNITS[sizeMatch[2].toLowerCase()];
    if (Number.isFinite(amount) && unit) {
      requirement.maxBytes = Math.round(amount * unit);
      matched.push(sizeMatch[0].trim());
      if (!actions.includes("compress")) actions.push("compress");
    }
  }

  const dimensionMatch = DIMENSION_PATTERN.exec(text);
  if (dimensionMatch) {
    requirement.exactWidth = Number.parseInt(dimensionMatch[1], 10);
    requirement.exactHeight = Number.parseInt(dimensionMatch[2], 10);
    matched.push(dimensionMatch[0].trim());
    if (!actions.includes("resize")) actions.push("resize");
  }

  const formatMatch = FORMAT_PATTERN.exec(text);
  if (formatMatch) {
    const raw = formatMatch[1].toLowerCase();
    requirement.format = (raw === "jpeg" ? "jpg" : raw) as TargetFormat;
    matched.push(formatMatch[0]);
    if (!actions.includes("convert")) actions.push("convert");
  }

  for (const { action, pattern } of ACTION_PATTERNS) {
    const actionMatch = pattern.exec(text);
    if (actionMatch && !actions.includes(action)) {
      actions.push(action);
      matched.push(actionMatch[0].trim());
    }
  }

  if (actions.includes("strip-metadata")) requirement.stripMetadata = true;

  const destination =
    DESTINATIONS.find((candidate) => candidate.pattern.test(text))?.id ?? null;
  if (destination) matched.push(destination.replace(/-/g, " "));

  // A bare size or format is enough to act on. Only a verb with no target is
  // ambiguous, and only an unparsed string should ever reach a model.
  const understood = matched.length;
  const confidence: ParsedIntent["confidence"] =
    understood === 0 ? "none" : requirement.maxBytes || requirement.format || destination ? "high" : "low";

  return { requirement, actions, destination, matched, confidence };
}
