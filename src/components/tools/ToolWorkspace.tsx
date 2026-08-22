"use client";

import { useMemo, useState } from "react";
import { TaskSurface } from "@/components/tools/TaskSurface";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatBytes } from "@/lib/format";
import type { ActionHint } from "@/lib/intent";
import { describeRequirement, type Requirement } from "@/lib/requirement";
import type { CropAspect, RotateDegrees } from "@/lib/ops/resize";
import type { DestinationOption, ToolPreset } from "@/lib/toolContent";
import { useFilePipeline, type LeadOperation } from "@/lib/useFilePipeline";
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
  lead,
  actions,
  className,
}: {
  preset: ToolPreset;
  accept?: string;
  runLabel?: string;
  /** Present only for tools that combine several files into one, e.g. merge. */
  lead?: LeadOperation;
  /** Fixed action hints the page always wants, e.g. remove-background. */
  actions?: readonly ActionHint[];
  className?: string;
}) {
  const [bytes, setBytes] = useState(preset.kind === "size" ? preset.defaultBytes : 0);
  const [width, setWidth] = useState(preset.kind === "dimensions" ? preset.defaultWidth : 0);
  const [height, setHeight] = useState(preset.kind === "dimensions" ? preset.defaultHeight : 0);
  const [destinationId, setDestinationId] = useState(
    preset.kind === "destination" ? preset.options[0]?.id : undefined,
  );
  const [rotate, setRotate] = useState<RotateDegrees | undefined>(undefined);
  const [cropAspect, setCropAspect] = useState<CropAspect | undefined>(undefined);
  const [pageOrder, setPageOrder] = useState<number[] | null>(null);
  const [pageRotation, setPageRotation] = useState<Record<number, number>>({});
  const [pdfRotateDegrees, setPdfRotateDegrees] = useState<RotateDegrees>(90);
  const [watermarkText, setWatermarkText] = useState("");
  const pageMode = preset.kind === "pages" ? preset.mode : null;

  const requirement = useMemo<Requirement>(() => {
    switch (preset.kind) {
      case "fixed":
        return preset.requirement;
      case "size":
        return { ...preset.requirement, maxBytes: bytes };
      case "dimensions":
        return { exactWidth: width, exactHeight: height };
      case "destination": {
        const option = preset.options.find((candidate) => candidate.id === destinationId);
        return option?.requirement ?? {};
      }
      case "transform":
        return { rotate, cropAspect };
      case "pages":
      case "pdf-rotate":
        return {};
      case "watermark":
        return { watermarkText: watermarkText.trim() || undefined };
      case "smartfix":
        return {};
    }
  }, [preset, bytes, width, height, destinationId, rotate, cropAspect, watermarkText]);

  /** Applied at run time — keep/rotate for organize-pdf come from the list below, not a preset value. */
  const effectiveLead = useMemo<LeadOperation | undefined>(() => {
    if (!lead) return lead;
    if (preset.kind === "pages") return { ...lead, keep: pageOrder ?? [], rotate: pageRotation };
    if (preset.kind === "pdf-rotate") return { ...lead, rotateAll: pdfRotateDegrees };
    return lead;
  }, [preset.kind, lead, pageOrder, pageRotation, pdfRotateDegrees]);

  const pipeline = useFilePipeline({ requirement, actions, lead: effectiveLead });
  const summary = describeRequirement(requirement);

  // Reset the page list when a new PDF replaces the old one — the endorsed
  // "adjust state during render" pattern (react.dev), not an effect, so it
  // can't cascade. Tracking the "previous" value in state rather than a ref
  // is required: refs must not be read during render.
  const [trackedAnalysis, setTrackedAnalysis] = useState(pipeline.analysis);
  if (preset.kind === "pages" && pipeline.analysis !== trackedAnalysis) {
    setTrackedAnalysis(pipeline.analysis);
    setPageOrder(
      pipeline.analysis?.pageCount
        ? Array.from({ length: pipeline.analysis.pageCount }, (_, i) => i)
        : null,
    );
    setPageRotation({});
  }

  const movePage = (position: number, direction: -1 | 1) => {
    setPageOrder((current) => {
      if (!current) return current;
      const target = position + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[position], next[target]] = [next[target], next[position]];
      return next;
    });
  };

  const rotatePage = (originalIndex: number) => {
    setPageRotation((current) => ({
      ...current,
      [originalIndex]: ((current[originalIndex] ?? 0) + 90) % 360,
    }));
  };

  const removePage = (position: number) => {
    setPageOrder((current) => current?.filter((_, index) => index !== position) ?? current);
  };

  const resetPages = () => {
    const count = pipeline.analysis?.pageCount ?? 0;
    setPageOrder(count > 0 ? Array.from({ length: count }, (_, i) => i) : null);
    setPageRotation({});
  };

  return (
    <Card data-testid="tool-workspace" className={cn("p-5 shadow-lg sm:p-6", className)}>
      {/* Fixed-requirement tools state the requirement rather than asking. */}
      {preset.kind === "fixed" && summary ? (
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

      {preset.kind === "destination" ? (
        <DestinationField
          label={preset.label}
          hint={preset.hint}
          options={preset.options}
          selectedId={destinationId}
          onChange={setDestinationId}
          disabled={pipeline.phase === "running"}
        />
      ) : null}

      {preset.kind === "transform" ? (
        <TransformField
          rotate={rotate}
          cropAspect={cropAspect}
          onRotate={setRotate}
          onCropAspect={setCropAspect}
          disabled={pipeline.phase === "running"}
        />
      ) : null}

      {preset.kind === "pdf-rotate" ? (
        <PdfRotateField
          degrees={pdfRotateDegrees}
          onChange={setPdfRotateDegrees}
          disabled={pipeline.phase === "running"}
        />
      ) : null}

      {preset.kind === "watermark" ? (
        <WatermarkField
          label={preset.label}
          hint={preset.hint}
          placeholder={preset.placeholder}
          value={watermarkText}
          onChange={setWatermarkText}
          disabled={pipeline.phase === "running"}
        />
      ) : null}

      {preset.kind === "pages" && pageOrder ? (
        <>
          <p className="mb-2 text-[0.75rem] text-ink-muted">
            {pageMode === "organize"
              ? "Reorder, rotate, or remove pages before saving."
              : pageMode === "delete"
                ? "Remove pages you do not want, then save the cleaned PDF."
                : pageMode === "export"
                  ? "Remove any pages you don't want exported, then save the images."
                  : "Remove pages you do not want in the output PDF, then save it."}
          </p>
          <PageList
            order={pageOrder}
            rotation={pageRotation}
            onMove={movePage}
            onRotate={rotatePage}
            onRemove={removePage}
            onReset={resetPages}
            disabled={pipeline.phase === "running"}
            allowReorder={pageMode === "organize"}
            allowRotate={pageMode === "organize"}
          />
        </>
      ) : null}

      <div className={preset.kind === "fixed" ? undefined : "mt-5"}>
        <TaskSurface
          pipeline={pipeline}
          accept={accept}
          runLabel={runLabel}
          multiple={lead?.id === "merge-pdf" || lead?.id === "images-to-pdf"}
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

/** A "target job" picker — the destination presets §5 asks for before raw dimensions. */
function DestinationField({
  label,
  hint,
  options,
  selectedId,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  options: readonly DestinationOption[];
  selectedId: string | undefined;
  onChange: (id: string) => void;
  disabled: boolean;
}) {
  const selected = options.find((option) => option.id === selectedId);

  return (
    <fieldset>
      <legend className="text-[0.8125rem] font-medium text-ink">{label}</legend>

      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={option.id === selectedId}
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
              option.id === selectedId
                ? "border-transparent bg-solid text-ink-inverse"
                : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-[0.75rem] text-ink-muted">{selected?.note ?? hint}</p>
    </fieldset>
  );
}

const ROTATE_OPTIONS: readonly { degrees: RotateDegrees | undefined; label: string }[] = [
  { degrees: undefined, label: "No rotation" },
  { degrees: 90, label: "90°" },
  { degrees: 180, label: "180°" },
  { degrees: 270, label: "270°" },
];

const CROP_OPTIONS: readonly { aspect: CropAspect | undefined; label: string }[] = [
  { aspect: undefined, label: "Original shape" },
  { aspect: "1:1", label: "Square" },
  { aspect: "4:3", label: "4:3" },
  { aspect: "3:4", label: "3:4" },
  { aspect: "16:9", label: "16:9" },
  { aspect: "9:16", label: "9:16" },
];

/** Rotate and crop are independent controls — either, both or neither. */
function TransformField({
  rotate,
  cropAspect,
  onRotate,
  onCropAspect,
  disabled,
}: {
  rotate: RotateDegrees | undefined;
  cropAspect: CropAspect | undefined;
  onRotate: (degrees: RotateDegrees | undefined) => void;
  onCropAspect: (aspect: CropAspect | undefined) => void;
  disabled: boolean;
}) {
  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
      active
        ? "border-transparent bg-solid text-ink-inverse"
        : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
    );

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-[0.8125rem] font-medium text-ink">Rotate</legend>
        <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Rotate">
          {ROTATE_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={rotate === option.degrees}
              disabled={disabled}
              onClick={() => onRotate(option.degrees)}
              className={chip(rotate === option.degrees)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[0.8125rem] font-medium text-ink">Crop to shape</legend>
        <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Crop to shape">
          {CROP_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={cropAspect === option.aspect}
              disabled={disabled}
              onClick={() => onCropAspect(option.aspect)}
              className={chip(cropAspect === option.aspect)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[0.75rem] text-ink-muted">
          Crops to the largest centred rectangle of that shape — trims the excess, never stretches.
        </p>
      </fieldset>
    </div>
  );
}

const PDF_ROTATE_OPTIONS: readonly { degrees: RotateDegrees; label: string }[] = [
  { degrees: 90, label: "90°" },
  { degrees: 180, label: "180°" },
  { degrees: 270, label: "270°" },
];

/** Whole-document rotate — one angle, applied to every page. */
function PdfRotateField({
  degrees,
  onChange,
  disabled,
}: {
  degrees: RotateDegrees;
  onChange: (degrees: RotateDegrees) => void;
  disabled: boolean;
}) {
  return (
    <fieldset>
      <legend className="text-[0.8125rem] font-medium text-ink">Rotate every page</legend>
      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Rotate every page">
        {PDF_ROTATE_OPTIONS.map((option) => (
          <button
            key={option.degrees}
            type="button"
            role="radio"
            aria-checked={degrees === option.degrees}
            disabled={disabled}
            onClick={() => onChange(option.degrees)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
              degrees === option.degrees
                ? "border-transparent bg-solid text-ink-inverse"
                : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {option.label} clockwise
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function WatermarkField({
  label,
  hint,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label htmlFor="watermark-text" className="block text-[0.8125rem] font-medium text-ink">
        {label}
      </label>
      <input
        id="watermark-text"
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={80}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-control border border-line bg-surface px-3.5 text-[0.9375rem] text-ink placeholder:text-ink-subtle transition-colors hover:border-line-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:opacity-60"
      />
      <p className="mt-2 text-[0.75rem] text-ink-muted">{hint}</p>
    </div>
  );
}

/**
 * organize-pdf's page editor — a numbered list, not a thumbnail grid, since
 * we have no page renderer to draw actual previews from (§ never claim a
 * preview we don't render).
 */
function PageList({
  order,
  rotation,
  onMove,
  onRotate,
  onRemove,
  onReset,
  disabled,
  allowReorder,
  allowRotate,
}: {
  order: readonly number[];
  rotation: Record<number, number>;
  onMove: (position: number, direction: -1 | 1) => void;
  onRotate: (originalIndex: number) => void;
  onRemove: (position: number) => void;
  onReset: () => void;
  disabled: boolean;
  allowReorder: boolean;
  allowRotate: boolean;
}) {
  if (order.length === 0) {
    return (
      <div className="rounded-card bg-warning-soft p-3.5">
        <p className="text-[0.8125rem] text-ink">Every page has been removed.</p>
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="mt-2 text-[0.75rem] font-medium text-brand disabled:opacity-50"
        >
          Restore all pages
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[0.8125rem] font-medium text-ink">
        {order.length} {order.length === 1 ? "page" : "pages"}, in this order
      </p>

      <ol className="mt-2.5 space-y-px overflow-hidden rounded-card border border-line">
        {order.map((originalIndex, position) => {
          const degrees = rotation[originalIndex] ?? 0;

          return (
            <li
              key={originalIndex}
              className={cn(
                "flex items-center gap-3 bg-surface p-3",
                position > 0 && "border-t border-line",
              )}
            >
              <span
                aria-hidden="true"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-[0.6875rem] font-semibold text-brand-ink"
              >
                {position + 1}
              </span>

              <span className="min-w-0 flex-1 text-[0.8125rem] font-medium text-ink">
                Page {originalIndex + 1}
                {degrees ? (
                  <span className="ml-1.5 font-normal text-ink-subtle">rotated {degrees}°</span>
                ) : null}
              </span>

              <span className="flex shrink-0 items-center gap-0.5">
                {allowRotate ? (
                  <PageButton
                    label={`Rotate page ${originalIndex + 1}`}
                    icon="rotate"
                    disabled={disabled}
                    onClick={() => onRotate(originalIndex)}
                  />
                ) : null}
                {allowReorder ? (
                  <>
                    <PageButton
                      label={`Move page ${originalIndex + 1} earlier`}
                      icon="caretUp"
                      disabled={disabled || position === 0}
                      onClick={() => onMove(position, -1)}
                    />
                    <PageButton
                      label={`Move page ${originalIndex + 1} later`}
                      icon="caretDown"
                      disabled={disabled || position === order.length - 1}
                      onClick={() => onMove(position, 1)}
                    />
                  </>
                ) : null}
                <PageButton
                  label={`Remove page ${originalIndex + 1}`}
                  icon="close"
                  disabled={disabled}
                  onClick={() => onRemove(position)}
                />
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PageButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: "rotate" | "caretUp" | "caretDown" | "close";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex size-9 items-center justify-center rounded-control text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon name={icon} className="size-4" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
