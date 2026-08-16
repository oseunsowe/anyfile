/**
 * Resize arithmetic. Pure, so it can be tested without a canvas.
 */

export type Size = { width: number; height: number };

export type ResizeSpec = {
  maxWidth?: number;
  maxHeight?: number;
  exactWidth?: number;
  exactHeight?: number;
};

/**
 * Target size for a resize step, or null when the image already complies.
 *
 * Aspect ratio is preserved for max-bound resizes. An exact target is honoured
 * literally — the destination asked for those pixels, and silently letterboxing
 * to keep the ratio would fail the requirement we are trying to satisfy.
 */
export function targetSize(current: Size, spec: ResizeSpec): Size | null {
  if (spec.exactWidth !== undefined && spec.exactHeight !== undefined) {
    if (current.width === spec.exactWidth && current.height === spec.exactHeight) {
      return null;
    }
    return { width: spec.exactWidth, height: spec.exactHeight };
  }

  const maxWidth = spec.maxWidth ?? Number.POSITIVE_INFINITY;
  const maxHeight = spec.maxHeight ?? Number.POSITIVE_INFINITY;

  if (current.width <= maxWidth && current.height <= maxHeight) return null;

  // Only ever shrink: a max bound must not enlarge a smaller image.
  const scale = Math.min(maxWidth / current.width, maxHeight / current.height, 1);

  return {
    width: Math.max(1, Math.round(current.width * scale)),
    height: Math.max(1, Math.round(current.height * scale)),
  };
}

/** Uniform downscale used by the compression fallback. Never returns 0. */
export function scaleBy(current: Size, factor: number): Size {
  return {
    width: Math.max(1, Math.round(current.width * factor)),
    height: Math.max(1, Math.round(current.height * factor)),
  };
}
