/**
 * HEIC decoding via libheif compiled to WebAssembly.
 *
 * ---------------------------------------------------------------------------
 * LICENCE AND PATENT NOTICE — read before shipping commercially.
 *
 * `libheif-js` is LGPL-3.0, and HEIC images are HEVC-coded. Two separate
 * obligations follow, and neither is settled by this code:
 *
 *  1. LGPL-3.0 requires that a recipient can replace the library with their own
 *     build. We therefore load it as an unmodified, separately-fetched chunk
 *     rather than inlining it into application code, and attribute it in
 *     THIRD-PARTY-LICENCES.md.
 *  2. HEVC decoding is patent-encumbered. Licensing pools exist (Access
 *     Advance, MPEG LA) and some vendors ship HEVC support only as a paid
 *     add-on. Whether a browser-side decoder in a commercial product needs a
 *     licence is a question for counsel, not for this file.
 *
 * The whole dependency is isolated in this module and gated by
 * NEXT_PUBLIC_ENABLE_HEIC so it can be switched off, or swapped, in one place.
 * ---------------------------------------------------------------------------
 */

import { OperationError } from "@/lib/ops/errors";

/** Off only when explicitly disabled, so local dev keeps working by default. */
export const HEIC_ENABLED = process.env.NEXT_PUBLIC_ENABLE_HEIC !== "false";

type Decoder = typeof import("libheif-js/wasm-bundle").default;

let decoderPromise: Promise<Decoder> | null = null;

/**
 * Loads the decoder on first use and caches the promise.
 *
 * The chunk is ~1.4 MB, so it must never be part of the initial payload
 * (plan.md §14: lazy-load heavy processing libraries). A dynamic import inside
 * the worker keeps it off the main thread and off every page that does not
 * touch a HEIC file.
 */
async function loadDecoder(): Promise<Decoder> {
  decoderPromise ??= import("libheif-js/wasm-bundle")
    .then((module) => module.default ?? (module as unknown as Decoder))
    .catch((error) => {
      // Do not cache a failed load — a flaky network should be retryable.
      decoderPromise = null;
      throw error;
    });

  return decoderPromise;
}

/** ISO-BMFF brands that indicate HEIC/HEIF rather than AVIF or plain MP4. */
const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "mif1", "msf1"]);

/** Cheap signature check so we only reach for the decoder when it can help. */
export async function looksLikeHeic(source: Blob): Promise<boolean> {
  const head = new Uint8Array(await source.slice(0, 16).arrayBuffer());
  if (head.length < 12) return false;

  const ascii = (offset: number, length: number) =>
    String.fromCharCode(...head.slice(offset, offset + length));

  return ascii(4, 4) === "ftyp" && HEIC_BRANDS.has(ascii(8, 4).toLowerCase());
}

export async function decodeHeic(source: Blob, maxPixels: number): Promise<ImageBitmap> {
  if (!HEIC_ENABLED) {
    throw new OperationError("HEIC support is turned off in this build.");
  }

  let libheif: Decoder;
  try {
    libheif = await loadDecoder();
  } catch {
    throw new OperationError(
      "Could not load the HEIC decoder. Check your connection and try again.",
    );
  }

  const buffer = new Uint8Array(await source.arrayBuffer());
  const images = new libheif.HeifDecoder().decode(buffer);

  if (!images || images.length === 0) {
    throw new OperationError("This HEIC file could not be read.");
  }

  // A HEIC container can hold bursts and Live Photo frames; the first image is
  // the primary one, which is what the user means by "the photo".
  const image = images[0];
  const width = image.get_width();
  const height = image.get_height();

  try {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
      throw new OperationError("This HEIC file reports invalid dimensions.");
    }

    // Checked before allocating: width × height × 4 bytes lands in memory next.
    if (width * height > maxPixels) {
      throw new OperationError("That image is too large to process safely in the browser.");
    }

    const target = new ImageData(width, height);

    await new Promise<void>((resolve, reject) => {
      image.display(target, (result) => {
        if (result) resolve();
        else reject(new OperationError("This HEIC file could not be decoded."));
      });
    });

    return await createImageBitmap(target);
  } finally {
    image.free?.();
  }
}
