/**
 * Plan catalogue and entitlement rules.
 *
 * There is no payment processor wired up yet (see roadmap: "Stripe
 * subscriptions"), so a "plan" here is a session attribute a signed-in demo
 * user can preview, not a paid subscription. What it unlocks is real —
 * `isPaidPlan` genuinely gates background removal and raises the upload
 * limit — but nothing here should claim to charge a card.
 */

export type PlanId = "free" | "daily" | "weekly" | "pro" | "business";

export const PLAN_ORDER: readonly PlanId[] = ["free", "daily", "weekly", "pro", "business"];

export function isPlanId(value: string): value is PlanId {
  return (PLAN_ORDER as readonly string[]).includes(value);
}

export function planRank(id: PlanId): number {
  return PLAN_ORDER.indexOf(id);
}

/** Anything above Free unlocks paid entitlements — ad-free, cloud AI, higher limits. */
export function isPaidPlan(id: PlanId): boolean {
  return id !== "free";
}

export type PlanDef = {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  /** Live in this build — actually enforced, safe to promise. */
  features: readonly string[];
  /** Not built yet — shown so the tier still reads as complete, never implied as active. */
  comingSoon: readonly string[];
  /** Whether the demo "preview this plan" flow can set this tier directly. */
  selectable: boolean;
  maxInputBytes: number;
};

export const PLANS: readonly PlanDef[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Core tools, no account needed.",
    features: [
      "Core image and PDF tools, on-device",
      "No account required",
      "Ad-supported sessions",
      "Files up to 100 MB",
    ],
    comingSoon: [],
    selectable: true,
    maxInputBytes: 100_000_000,
  },
  {
    id: "daily",
    name: "Daily",
    price: "$1.49",
    cadence: "per day",
    tagline: "For a one-off job today.",
    features: [
      "Everything in Free",
      "Ad-free for 24 hours",
      "Background removal unlocked",
      "Files up to 250 MB",
    ],
    comingSoon: [],
    selectable: true,
    maxInputBytes: 250_000_000,
  },
  {
    id: "weekly",
    name: "Weekly",
    price: "$4.99",
    cadence: "per week",
    tagline: "For a short project.",
    features: [
      "Everything in Daily",
      "Ad-free for 7 days",
      "Background removal unlocked",
      "Files up to 250 MB",
    ],
    comingSoon: [],
    selectable: true,
    maxInputBytes: 250_000_000,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    cadence: "per month",
    tagline: "For ongoing, regular use.",
    features: [
      "Everything in Weekly, billed monthly",
      "Ad-free every session",
      "Background removal unlocked",
      "Files up to 500 MB",
    ],
    comingSoon: ["Saved workflows", "Priority cloud queue", "Job history and re-run"],
    selectable: true,
    maxInputBytes: 500_000_000,
  },
  {
    id: "business",
    name: "Business",
    price: "Contact sales",
    cadence: "",
    tagline: "For teams.",
    features: ["Everything in Pro", "Ad-free every session", "Files up to 1 GB"],
    comingSoon: ["Team seats and shared workflows", "Admin controls", "Usage reporting", "API access"],
    selectable: false,
    maxInputBytes: 1_000_000_000,
  },
] as const;

const byId = new Map(PLANS.map((plan) => [plan.id, plan]));

export function getPlan(id: PlanId): PlanDef {
  const plan = byId.get(id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}
