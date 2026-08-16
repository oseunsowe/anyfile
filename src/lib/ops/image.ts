/**
 * Image primitives. Runs inside the pipeline worker, so it may use
 * OffscreenCanvas and createImageBitmap but never `document` or `window`.
 */

import { OperationError } from "@/lib/ops/errors";
import { decodeHeic, HEIC_ENABLED, looksLikeHeic } from "@/lib/ops/heic";
import { CancelledError, SCALE_LADDER, searchQuality } from "@/lib/ops/quality";
import { scaleBy, targetSize, type ResizeSpec, type Size } from "@/lib/ops/resize";

export { OperationError };

/**
 * Refuse absurd rasters before allocating for them. 80 MP at 4 bytes per pixel
 * is already ~320 MB of canvas — beyond this a mobile browser will be killed by
 * the OS rather than return an error we can show (§13 decompression bombs,
 * todo.md "memory guards for mobile browsers").
 */
export const MAX_PIXELS = 80_000_000;

function guardSize(bitmap: ImageBitmap): ImageBitmap {
  if (bitmap.width * bitmap.height > MAX_PIXELS) {
    bitmap.close();
    throw new OperationError("That image is too large to process safely in the browser.");
  }
  return bitmap;
}

/**
 * Decodes any supported image.
 *
 * Native `createImageBitmap` is tried first and is not merely an optimisation:
 * Safari and iOS decode HEIC natively, and those are precisely the users most
 * likely to hand us one. Going native-first means they never download the
 * ~1.4 MB WebAssembly decoder at all.
 */
export async function decodeImage(source: Blob): Promise<ImageBitmap> {
  try {
    return guardSize(await createImageBitmap(source));
  } catch (error) {
    // Our own guard must not be swallowed by the fallback path.
    if (error instanceof OperationError) throw error;

    if (HEIC_ENABLED && (await looksLikeHeic(source))) {
      return guardSize(await decodeHeic(source, MAX_PIXELS));
    }

    throw new OperationError("This browser cannot read that image format.");
  }
}

/** Encoders that ignore the quality parameter entirely. */
export function isLossless(mime: string): boolean {
  return mime === "image/png";
}

/**
 * Draws a bitmap to an offscreen canvas and encodes it.
 *
 * Re-encoding is also how metadata removal works: a canvas holds pixels only,
 * so EXIF, GPS and colour-profile blocks cannot survive the round trip.
 */
export async function encodeImage(
  bitmap: ImageBitmap,
  mime: string,
  quality: number,
  size?: Size,
): Promise<Blob> {
  const width = size?.width ?? bitmap.width;
  const height = size?.height ?? bitmap.height;

  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new OperationError("Could not prepare the image for encoding.");

  // JPEG has no alpha channel. Without this, transparent pixels encode as
  // black, which is the classic "why is my logo on a black square" bug.
  if (mime === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);

  const blob = await canvas.convertToBlob({
    type: mime,
    ...(isLossless(mime) ? {} : { quality }),
  });

  // convertToBlob silently falls back to PNG for a type it cannot encode.
  if (blob.type !== mime) {
    throw new OperationError(
      `This browser cannot save ${mime.replace("image/", "").toUpperCase()} files.`,
    );
  }

  return blob;
}

export async function resizeImage(
  bitmap: ImageBitmap,
  spec: ResizeSpec,
  mime: string,
): Promise<{ blob: Blob; size: Size } | null> {
  const size = targetSize({ width: bitmap.width, height: bitmap.height }, spec);
  if (!size) return null;

  const blob = await encodeImage(bitmap, mime, 0.92, size);
  return { blob, size };
}

export type CompressResult = {
  blob: Blob;
  size: Size;
  /** False when we hit the floor without reaching the target. */
  metTarget: boolean;
};

/**
 * Compresses toward a hard byte ceiling.
 *
 * Two stages, in this order deliberately: reduce quality first, because it
 * costs the least perceptually, and only shed pixels once quality alone cannot
 * get there. Returns its best attempt with `metTarget: false` rather than
 * throwing — the user should still receive the file and see an honest FAIL
 * against the requirement.
 */
export async function compressToTarget(
  bitmap: ImageBitmap,
  mime: string,
  maxBytes: number,
  hooks: {
    onProgress?: (percent: number) => void;
    isCancelled?: () => boolean;
  } = {},
): Promise<CompressResult> {
  const { onProgress, isCancelled } = hooks;
  const original: Size = { width: bitmap.width, height: bitmap.height };

  // Number of ladder rungs we may attempt, for progress reporting.
  const rounds = SCALE_LADDER.length + 1;

  const attemptAt = async (size: Size, round: number): Promise<Blob | null> => {
    if (isLossless(mime)) {
      // PNG ignores quality, so scaling is the only lever available.
      if (isCancelled?.()) throw new CancelledError();
      onProgress?.(Math.round(((round + 1) / rounds) * 100));
      const blob = await encodeImage(bitmap, mime, 1, size);
      return blob.size <= maxBytes ? blob : null;
    }

    const found = await searchQuality({
      encode: (quality) => encodeImage(bitmap, mime, quality, size),
      maxBytes,
      isCancelled,
      onAttempt: (attempt, total) => {
        const withinRound = attempt / total;
        onProgress?.(Math.round(((round + withinRound) / rounds) * 100));
      },
    });

    return found?.result ?? null;
  };

  const atFullSize = await attemptAt(original, 0);
  if (atFullSize) return { blob: atFullSize, size: original, metTarget: true };

  let lastAttempt: { blob: Blob; size: Size } | null = null;

  for (const [index, factor] of SCALE_LADDER.entries()) {
    const size = scaleBy(original, factor);
    const blob = await attemptAt(size, index + 1);
    if (blob) return { blob, size, metTarget: true };

    // Keep the smallest thing we produced, in case nothing ever fits.
    lastAttempt = {
      blob: await encodeImage(bitmap, mime, isLossless(mime) ? 1 : 0.3, size),
      size,
    };
  }

  if (!lastAttempt) {
    throw new OperationError("Could not compress this image any further.");
  }

  return { ...lastAttempt, metTarget: false };
}
