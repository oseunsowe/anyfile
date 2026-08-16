"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";

export type FileDropProps = {
  onFiles: (files: File[]) => void;
  /** Accept attribute, e.g. ".pdf,.jpg,image/*". Omit to accept anything. */
  accept?: string;
  multiple?: boolean;
  /** Rejected above this size, with a readable message (§13). */
  maxBytes?: number;
  disabled?: boolean;
  title?: string;
  hint?: string;
  className?: string;
};

/**
 * The primary input surface (todo.md P0 "Core UX Shell").
 *
 * Supports drag/drop, browse and clipboard paste. Accessibility is handled by
 * keeping a real <input type="file"> as the interactive element — it is visually
 * hidden but focusable, so keyboard and screen-reader users get the native file
 * picker rather than a div pretending to be a button (§12).
 */
export function FileDrop({
  onFiles,
  accept,
  multiple = false,
  maxBytes,
  disabled = false,
  title = "Drop a file here",
  hint,
  className,
}: FileDropProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept_ = accept;

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const files = Array.from(list);

      if (maxBytes) {
        const tooLarge = files.find((file) => file.size > maxBytes);
        if (tooLarge) {
          setError(
            `${tooLarge.name} is ${formatBytes(tooLarge.size)}. The limit is ${formatBytes(maxBytes)}.`,
          );
          return;
        }
      }

      setError(null);
      onFiles(multiple ? files : files.slice(0, 1));
    },
    [maxBytes, multiple, onFiles],
  );

  // Clipboard paste (§4.2). Scoped to the window because paste has no target
  // until something is focused, and users paste without clicking first.
  useEffect(() => {
    if (disabled) return;

    function onPaste(event: ClipboardEvent) {
      const files = event.clipboardData?.files;
      if (files && files.length > 0) {
        event.preventDefault();
        handleFiles(files);
      }
    }

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [disabled, handleFiles]);

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          // Ignore bubbling from children so the state does not flicker.
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setIsDragging(false);
        }}
        onDrop={(event) => {
          if (disabled) return;
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "relative rounded-panel border-2 border-dashed p-8 text-center transition-colors sm:p-10",
          isDragging
            ? "border-brand bg-brand-soft"
            : "border-line-strong bg-surface hover:border-brand/60 hover:bg-surface-muted",
          disabled && "pointer-events-none opacity-60",
          error && "border-danger",
        )}
      >
        <span
          className={cn(
            "mx-auto flex size-12 items-center justify-center rounded-full transition-all duration-200",
            isDragging ? "scale-110 bg-brand text-white" : "bg-brand-soft text-brand",
          )}
        >
          <Icon name="uploadDuo" className="size-6" />
        </span>

        <label
          htmlFor={inputId}
          className="mt-4 block cursor-pointer text-[0.9375rem] font-semibold text-ink"
        >
          {title}
        </label>
        <p className="mt-1 text-[0.8125rem] text-ink-muted">
          {hint ?? "or paste from your clipboard"}
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex h-10 items-center rounded-control border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
        >
          Browse files
        </button>

        {/* Focusable and labelled, but visually replaced by the surface above. */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept_}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            handleFiles(event.target.files);
            // Allow re-selecting the same file after a reset.
            event.target.value = "";
          }}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-describedby={hint ? `${inputId}-hint` : undefined}
        />
      </div>

      {/* Announced on change so errors reach screen readers (§12). */}
      <p role="status" aria-live="polite" className="sr-only">
        {isDragging ? "File ready to drop" : ""}
      </p>

      {error ? (
        <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
