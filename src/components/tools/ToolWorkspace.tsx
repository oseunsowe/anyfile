"use client";

import { useMemo, useState } from "react";
import { TaskSurface } from "@/components/tools/TaskSurface";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatBytes } from "@/lib/format";
import { describeRequirement, type Requirement } from "@/lib/requirement";
import type { ToolPreset } from "@/lib/toolContent";
import { useFilePipeline } from "@/lib/useFilePipeline";
import { cn } from "@/lib/cn";

/**
 * A single tool, preconfigured by its landing page.
 *
 * plan.md §5: each tool teaches itself by being used, and exposes only the
 * settings relevant to its job. A page like /image-under-2mb asks nothing at
 * all — the URL already carries the requirement — while /compress-image asks
 * for one number and nothing else.
 */
export function ToolWorkspace({
  preset,
  accept,
  runLabel,
  className,
}: {
  preset: ToolPreset;
  accept?: string;
  runLabel?: string;
  className?: string;
}) {
  const [bytes, setBytes] = useState(preset.kind === "size" ? preset.defaultBytes : 0);
  const [width, setWidth] = useState(preset.kind === "dimensions" ? preset.defaultWidth : 0);
  const [height, setHeight] = useState(preset.kind === "dimensions" ? preset.defaultHeight : 0);

  const requirement = useMemo<Requirement>(() => {
    switch (preset.kind) {
      case "fixed":
        return preset.requirement;
      case "size":
        return { ...preset.requirement, maxBytes: bytes };
      case "dimensions":
        return { exactWidth: width, exactHeight: height };
    }
  }, [preset, bytes, width, height]);

  const pipeline = useFilePipeline({ requirement });
  const summary = describeRequirement(requirement);

  return (
    <Card data-testid="tool-workspace" className={cn("p-5 shadow-lg sm:p-6", className)}>
      {/* Fixed-requirement tools state the requirement rather than asking. */}
      {preset.kind === "fixed" ? (
        <p className="mb-5 flex flex-wrap items-center gap-2 text-[0.8125rem] text-ink-muted">
          <span>This tool targets</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 font-medium text-brand-ink">
            <Icon name="check" className="size-3.5" />
            {summary}
          </span>
        </p>
      ) : null}

      {preset.kind === "size" ? (
        <SizeField
          label={preset.label}
          hint={preset.hint}
          bytes={bytes}
          onChange={setBytes}
          disabled={pipeline.phase === "running"}
        />
      ) : null}

      {preset.kind === "dimensions" ? (
        <DimensionField
          label={preset.label}
          hint={preset.hint}
          width={width}
          height={height}
          onWidth={setWidth}
          onHeight={setHeight}
          disabled={pipeline.phase === "running"}
        />
      ) : null}

      <div className={preset.kind === "fixed" ? undefined : "mt-5"}>
        <TaskSurface
          pipeline={pipeline}
          accept={accept}
          runLabel={runLabel}
          emptyPlanMessage="This file already meets the requirement — there is nothing to change."
        />
      </div>
    </Card>
  );
}

/** Megabyte-denominated, because that is the unit every upload form quotes. */
function SizeField({
  label,
  hint,
  bytes,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  bytes: number;
  onChange: (bytes: number) => void;
  disabled: boolean;
}) {
  const PRESETS = [500_000, 1_000_000, 2_000_000, 5_000_000];

  return (
    <div>
      <label htmlFor="target-size" className="block text-[0.8125rem] font-medium text-ink">
        {label}
      </label>

      <div className="mt-2 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id="target-size"
            type="number"
            min={0.05}
            step={0.05}
            value={(bytes / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}
            disabled={disabled}
            onChange={(event) => {
              const value = Number.parseFloat(event.target.value);
              if (Number.isFinite(value) && value > 0) onChange(Math.round(value * 1_000_000));
            }}
            className="h-11 w-full rounded-control border border-line bg-surface pl-3.5 pr-12 text-[0.9375rem] text-ink transition-colors hover:border-line-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:opacity-60"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.8125rem] font-medium text-ink-subtle">
            MB
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[0.75rem] font-medium transition-colors",
              bytes === value
                ? "border-transparent bg-solid text-ink-inverse"
                : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {formatBytes(value, 0)}
          </button>
        ))}
      </div>

      <p className="mt-2 text-[0.75rem] text-ink-muted">{hint}</p>
    </div>
  );
}

function DimensionField({
  label,
  hint,
  width,
  height,
  onWidth,
  onHeight,
  disabled,
}: {
  label: string;
  hint: string;
  width: number;
  height: number;
  onWidth: (value: number) => void;
  onHeight: (value: number) => void;
  disabled: boolean;
}) {
  const field =
    "h-11 w-full rounded-control border border-line bg-surface px-3.5 text-[0.9375rem] text-ink transition-colors hover:border-line-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:opacity-60";

  return (
    <fieldset>
      <legend className="text-[0.8125rem] font-medium text-ink">{label}</legend>

      <div className="mt-2 flex items-center gap-3">
        <div className="flex-1">
          <label htmlFor="target-width" className="sr-only">
            Width in pixels
          </label>
          <input
            id="target-width"
            type="number"
            min={1}
            value={width || ""}
            disabled={disabled}
            onChange={(event) => onWidth(Number.parseInt(event.target.value, 10) || 0)}
            className={field}
          />
        </div>
        <span aria-hidden="true" className="text-ink-subtle">
          ×
        </span>
        <div className="flex-1">
          <label htmlFor="target-height" className="sr-only">
            Height in pixels
          </label>
          <input
            id="target-height"
            type="number"
            min={1}
            value={height || ""}
            disabled={disabled}
            onChange={(event) => onHeight(Number.parseInt(event.target.value, 10) || 0)}
            className={field}
          />
        </div>
        <span className="text-[0.8125rem] text-ink-subtle">px</span>
      </div>

      <p className="mt-2 text-[0.75rem] text-ink-muted">{hint}</p>
    </fieldset>
  );
}
