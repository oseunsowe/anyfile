/**
 * Destination Workflows — "Tell us where it's going" (plan.md §3).
 *
 * A Workflow is a named destination plus the Requirement that destination
 * imposes. Workflows are the repeat-use surface that turns a one-off search
 * visitor into a returning user, so their correctness matters commercially as
 * well as functionally.
 *
 * `source` is load-bearing:
 *  - "ours"     — a sensible default we chose. The user can edit it, and we are
 *                 not asserting anything about a third party.
 *  - "platform" — a claim about someone else's published rules. These must be
 *                 researched and dated before they are shown (§"Destination
 *                 Presets": store requirement versions and last-reviewed date).
 */

import type { Requirement } from "@/lib/requirement";

export type WorkflowSource = "ours" | "platform";

export type Workflow = {
  id: string;
  name: string;
  /** Plain-language outcome, in the user's words rather than ours. */
  outcome: string;
  requirement: Requirement;
  source: WorkflowSource;
  /** Only meaningful for `platform` workflows. ISO date of last verification. */
  lastReviewed: string | null;
  /** Where the platform rule was read from. */
  reference: string | null;
};

export const workflows: readonly Workflow[] = [
  {
    id: "job-application",
    name: "Job Application Ready",
    outcome: "A PDF small enough for a job portal, still readable.",
    requirement: { format: "pdf", maxBytes: 2_000_000, stripMetadata: true },
    source: "ours",
    lastReviewed: null,
    reference: null,
  },
  {
    id: "email",
    name: "Email Ready",
    outcome: "Small enough to attach without a bounce.",
    requirement: { maxBytes: 10_000_000 },
    source: "ours",
    lastReviewed: null,
    reference: null,
  },
  {
    id: "privacy-clean",
    name: "Privacy Clean",
    outcome: "No location, device or author data left in the file.",
    requirement: { stripMetadata: true },
    source: "ours",
    lastReviewed: null,
    reference: null,
  },
  {
    id: "web",
    name: "Web Ready",
    outcome: "Fast-loading images that still look sharp.",
    requirement: { format: "webp", maxBytes: 300_000, maxWidth: 2000 },
    source: "ours",
    lastReviewed: null,
    reference: null,
  },

  // ---------------------------------------------------------------------
  // Platform workflows — NOT published until researched and dated.
  // The numbers below are placeholders so the shape is testable; they are
  // deliberately withheld from the UI by getPublishableWorkflows().
  // ---------------------------------------------------------------------
  {
    id: "etsy",
    name: "Etsy Product Image",
    outcome: "Listing photos sized the way Etsy wants them.",
    requirement: { format: "jpg", minWidth: 2000, minHeight: 2000 },
    source: "platform",
    lastReviewed: null,
    reference: null,
  },
  {
    id: "amazon",
    name: "Amazon Product Image",
    outcome: "Main product images that pass Amazon's checks.",
    requirement: { format: "jpg", minWidth: 1600, minHeight: 1600 },
    source: "platform",
    lastReviewed: null,
    reference: null,
  },
  {
    id: "linkedin",
    name: "LinkedIn Ready",
    outcome: "A profile photo that stays sharp at every size.",
    requirement: { format: "jpg", minWidth: 400, minHeight: 400 },
    source: "platform",
    lastReviewed: null,
    reference: null,
  },
  {
    id: "youtube",
    name: "YouTube Thumbnail",
    outcome: "A thumbnail at the size YouTube expects.",
    requirement: { format: "jpg", exactWidth: 1280, exactHeight: 720, maxBytes: 2_000_000 },
    source: "platform",
    lastReviewed: null,
    reference: null,
  },
] as const;

/**
 * Workflows safe to show. A platform workflow qualifies only once someone has
 * read the current published requirement and dated it here.
 */
export function getPublishableWorkflows(): Workflow[] {
  return workflows.filter(
    (workflow) => workflow.source === "ours" || workflow.lastReviewed !== null,
  );
}

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.find((workflow) => workflow.id === id);
}
