import { Icon, type IconName } from "@/components/ui/Icon";
import { formatBytes, formatReduction } from "@/lib/format";
import {
  overallStatus,
  type CheckStatus,
  type RequirementCheck,
} from "@/lib/requirement";
import { cn } from "@/lib/cn";

/**
 * Proof, not "Done" (plan.md §4.5).
 *
 * The success screen states what changed and whether the stated requirement was
 * actually met. An unverifiable check renders as "Not verified" — never as a
 * pass — because the entire value of this screen is that the user can trust it
 * instead of uploading and hoping.
 */
export type OutcomeFacts = {
  format: string | null;
  width: number | null;
  height: number | null;
};

export function ProofPanel({
  checks,
  beforeBytes,
  afterBytes,
  facts,
  className,
}: {
  checks: readonly RequirementCheck[];
  beforeBytes?: number;
  afterBytes?: number;
  /** Measured properties of the output, shown whether or not they were asked for. */
  facts?: OutcomeFacts;
  className?: string;
}) {
  const status = overallStatus(checks);

  /**
   * §4.5 wants the success screen to report what changed — format, dimensions,
   * size — not only the boxes that were ticked. Without this, converting HEIC
   * to JPG would confirm the format and silently omit everything else.
   */
  const measured: { label: string; value: string }[] = [];
  if (facts?.format) measured.push({ label: "Format", value: facts.format.toUpperCase() });
  if (facts?.width && facts.height) {
    measured.push({ label: "Dimensions", value: `${facts.width} × ${facts.height}` });
  }
  if (afterBytes !== undefined) {
    measured.push({ label: "Size", value: formatBytes(afterBytes) });
  }

  return (
    <div className={cn("space-y-4", className)}>
      <VerdictBanner status={status} />

      {beforeBytes !== undefined && afterBytes !== undefined ? (
        <p className="font-mono text-[0.8125rem] text-ink">
          {formatReduction(beforeBytes, afterBytes)}
        </p>
      ) : null}

      {measured.length > 0 ? (
        <dl className="flex flex-wrap gap-x-6 gap-y-2 rounded-card bg-surface-muted p-3.5">
          {measured.map((fact) => (
            <div key={fact.label}>
              <dt className="text-[0.75rem] text-ink-subtle">{fact.label}</dt>
              <dd className="font-medium text-[0.8125rem] text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {checks.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line">
          {checks.map((check) => (
            <li
              key={check.id}
              className="flex items-center justify-between gap-4 bg-surface p-3.5"
            >
              <div className="min-w-0">
                <p className="text-[0.8125rem] font-medium text-ink">{check.label}</p>
                <p className="text-[0.75rem] text-ink-muted">
                  Required: {check.required}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-[0.8125rem] text-ink">{check.actual}</span>
                <StatusIcon status={check.status} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function VerdictBanner({ status }: { status: CheckStatus }) {
  const config = {
    pass: {
      className: "bg-success-soft text-success",
      label: "Requirement met",
      detail: "Every stated requirement was checked against the result.",
    },
    fail: {
      className: "bg-danger-soft text-danger",
      label: "Requirement not met",
      detail: "At least one requirement could not be satisfied. See the detail below.",
    },
    unknown: {
      className: "bg-warning-soft text-warning",
      label: "Not fully verified",
      detail: "Some requirements could not be measured, so we are not claiming a pass.",
    },
  }[status];

  return (
    <div className={cn("flex items-start gap-2.5 rounded-card p-4", config.className)}>
      <StatusIcon status={status} className="mt-0.5" />
      <div>
        <p className="text-[0.9375rem] font-semibold">{config.label}</p>
        <p className="mt-0.5 text-[0.8125rem] text-ink-muted">{config.detail}</p>
      </div>
    </div>
  );
}

const STATUS_ICONS: Record<CheckStatus, { icon: IconName; tone: string; label: string }> = {
  pass: { icon: "sealCheck", tone: "text-success", label: "Passed" },
  fail: { icon: "close", tone: "text-danger", label: "Failed" },
  unknown: { icon: "question", tone: "text-warning", label: "Not verified" },
};

/** Icon plus text label — status is never conveyed by colour alone (§12). */
function StatusIcon({
  status,
  className,
}: {
  status: CheckStatus;
  className?: string;
}) {
  const { icon, tone, label } = STATUS_ICONS[status];

  return (
    <span className={cn("inline-flex items-center gap-1", tone, className)}>
      <Icon name={icon} className="size-4" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Compact size delta for result cards and history rows. */
export function SizeDelta({ before, after }: { before: number; after: number }) {
  return (
    <span className="font-mono text-[0.8125rem] tabular-nums text-ink-muted">
      {formatBytes(before)} → <span className="text-ink">{formatBytes(after)}</span>
    </span>
  );
}
