import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge, PrivacyBadge } from "@/components/ui/Badge";
import { formatBytes } from "@/lib/format";
import { kindLabel, type FileAnalysis } from "@/lib/analyze";
import { getTool } from "@/lib/tools";
import { cn } from "@/lib/cn";

/**
 * Smart Diagnosis (plan.md §4.3): what we found, before any operation runs.
 * This is the moment the product demonstrates intelligence at effectively zero
 * cost, so it states facts only — never a guess dressed as a finding.
 */
export function DiagnosisPanel({
  analysis,
  className,
}: {
  analysis: FileAnalysis;
  className?: string;
}) {
  const facts: { label: string; value: string }[] = [
    { label: "Format", value: kindLabel(analysis.kind) },
    { label: "Size", value: formatBytes(analysis.size) },
  ];

  if (analysis.width && analysis.height) {
    facts.push({ label: "Dimensions", value: `${analysis.width} × ${analysis.height}` });
  }

  if (analysis.pageCount !== null) {
    facts.push({
      label: "Pages",
      value: `${analysis.pageCount} ${analysis.pageCount === 1 ? "page" : "pages"}`,
    });
  }

  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[0.9375rem] font-semibold text-ink">
            {analysis.name}
          </h3>
          <PrivacyBadge mode="device" />
        </div>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {facts.map((fact) => (
            <div key={fact.label} className="text-[0.8125rem]">
              <dt className="text-ink-subtle">{fact.label}</dt>
              <dd className="font-medium text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {analysis.findings.length === 0 ? (
        <div className="flex items-start gap-2.5 rounded-card bg-success-soft p-3.5">
          <Icon name="shieldCheck" className="mt-0.5 size-4 text-success" />
          <p className="text-[0.8125rem] text-ink">
            No problems found. This file looks ready to use as it is.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-[0.8125rem] font-medium text-ink">
            We found {analysis.findings.length}{" "}
            {analysis.findings.length === 1 ? "issue" : "issues"}
          </p>
          <ul className="mt-2.5 space-y-2">
            {analysis.findings.map((finding) => {
              const fixTool = finding.fix ? getTool(finding.fix) : undefined;
              const isWarning = finding.level === "warning";

              return (
                <li
                  key={finding.id}
                  className={cn(
                    "flex items-start gap-2.5 rounded-card p-3.5",
                    isWarning ? "bg-warning-soft" : "bg-surface-muted",
                  )}
                >
                  <Icon
                    name={isWarning ? "warning" : "info"}
                    className={cn(
                      "mt-0.5 size-4",
                      isWarning ? "text-warning" : "text-ink-subtle",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-[0.8125rem] font-medium text-ink">{finding.title}</p>
                    <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                      {finding.detail}
                    </p>
                    {fixTool ? (
                      <p className="mt-1.5">
                        {fixTool.status === "live" ? (
                          <Link
                            href={`/${fixTool.slug}`}
                            className="text-[0.8125rem] font-medium text-brand underline-offset-2 hover:underline"
                          >
                            Fix with {fixTool.name} →
                          </Link>
                        ) : (
                          <Badge tone="neutral">{fixTool.name} — coming soon</Badge>
                        )}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
