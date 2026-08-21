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

export type RotateDegrees = 90 | 180 | 270;

/** Canvas size after a rotation — 90/270 swap the axes, 180 does not. */
export function rotatedSize(size: Size, degrees: RotateDegrees): Size {
  return degrees === 180 ? size : { width: size.height, height: size.width };
}

export type CropAspect = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

const ASPECT_RATIOS: Record<CropAspect, number> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
};

export type CropRect = { x: number; y: number; width: number; height: number };

/**
 * A centred crop rectangle for the given target shape.
 *
 * Always the largest rectangle of that aspect that fits inside the source —
 * cropping trims the excess dimension rather than padding, so no pixels are
 * invented and nothing is stretched.
 */
export function cropRectFor(source: Size, aspect: CropAspect): CropRect {
  const ratio = ASPECT_RATIOS[aspect];
  const sourceRatio = source.width / source.height;

  const width = sourceRatio > ratio ? Math.round(source.height * ratio) : source.width;
  const height = sourceRatio > ratio ? source.height : Math.round(source.width / ratio);

  return {
    width,
    height,
    x: Math.floor((source.width - width) / 2),
    y: Math.floor((source.height - height) / 2),
  };
}
