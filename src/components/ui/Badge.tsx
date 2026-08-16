import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { ProcessingMode } from "@/lib/tools";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-ink-muted border-line",
  brand: "bg-brand-soft text-brand-ink border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * plan.md §1.3 — the interface must state truthfully where a file is processed.
 * This badge is the only sanctioned way to make that claim, and it is driven by
 * the tool registry rather than hand-written per page.
 */
export function PrivacyBadge({
  mode,
  className,
}: {
  mode: ProcessingMode;
  className?: string;
}) {
  if (mode === "device") {
    return (
      <Badge tone="success" className={className}>
        <Icon name="shieldCheck" className="size-3.5" />
        Processed on your device
      </Badge>
    );
  }

  return (
    <Badge tone="neutral" className={className}>
      <Icon name="cloud" className="size-3.5" />
      Secure cloud processing
    </Badge>
  );
}
