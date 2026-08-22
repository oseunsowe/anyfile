/**
 * PDF operations, built on pdf-lib (MIT).
 *
 * pdf-lib manipulates a PDF's structure — pages, ordering, metadata — but has
 * no built-in support for re-encoding the images inside one, so `compressPdf`
 * below does that itself: it walks each page's image XObjects, decodes the
 * ones it can safely re-encode, and recompresses them through the same
 * quality/scale search used for a standalone photo (`compressToTarget`). It
 * is deliberately conservative about which images qualify (see
 * `isRecompressibleImage`) — leaving an image untouched is always safe;
 * mis-decoding one is not.
 *
 * pdf-lib is ~350 KB, so it is dynamically imported and never lands in the
 * initial payload (plan.md §14).
 */

import { compressToTarget } from "@/lib/ops/image";
import { OperationError } from "@/lib/ops/errors";
import { CancelledError } from "@/lib/ops/quality";
// Type-only: erased at compile time, so this does not pull pdf-lib into the
// eager bundle the way importing its runtime values would.
import type { PDFDict, PDFDocument, PDFRawStream, PDFRef } from "pdf-lib";

type PdfLib = typeof import("pdf-lib");

let libPromise: Promise<PdfLib> | null = null;

async function loadPdfLib(): Promise<PdfLib> {
  libPromise ??= import("pdf-lib").catch((error) => {
    libPromise = null;
    throw error;
  });
  return libPromise;
}

/**
 * Loads a document, translating pdf-lib's failure modes into messages a person
 * can act on. An encrypted PDF is the common one and deserves its own wording.
 */
async function load(lib: PdfLib, bytes: Uint8Array, label?: string) {
  try {
    return await lib.PDFDocument.load(bytes);
  } catch (error) {
    const name = label ? `“${label}” ` : "";
    if (error instanceof lib.EncryptedPDFError) {
      throw new OperationError(
        `${name}is password-protected. Remove the password and try again.`,
      );
    }
    throw new OperationError(`${name}could not be read — the file may be damaged.`);
  }
}

async function bytesOf(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

function toPdfBlob(bytes: Uint8Array): Blob {
  // Copy into a plain ArrayBuffer: pdf-lib may hand back a view over a larger
  // buffer, and Blob would otherwise capture the whole thing.
  return new Blob([bytes.slice().buffer as ArrayBuffer], { type: "application/pdf" });
}

/** Total pages, for the diagnosis panel. */
export async function readPageCount(source: Blob): Promise<number | null> {
  try {
    const lib = await loadPdfLib();
    const doc = await lib.PDFDocument.load(await bytesOf(source));
    return doc.getPageCount();
  } catch {
    // Encrypted or damaged: report "unknown" rather than guessing.
    return null;
  }
}

/** §13 — a structural bomb guard before we start copying pages. */
const MAX_PAGES = 5_000;

export async function mergePdfs(
  sources: readonly { blob: Blob; name: string }[],
  onProgress?: (percent: number) => void,
): Promise<Blob> {
  if (sources.length === 0) throw new OperationError("No files to merge.");

  const lib = await loadPdfLib();
  const merged = await lib.PDFDocument.create();
  let total = 0;

  for (const [index, source] of sources.entries()) {
    const doc = await load(lib, await bytesOf(source.blob), source.name);

    total += doc.getPageCount();
    if (total > MAX_PAGES) {
      throw new OperationError(`Merging would exceed ${MAX_PAGES} pages.`);
    }

    // copyPages carries the page's resources across; addPage alone would not.
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    for (const page of pages) merged.addPage(page);

    onProgress?.(Math.round(((index + 1) / sources.length) * 100));
  }

  if (merged.getPageCount() === 0) {
    throw new OperationError("Those PDFs contain no pages.");
  }

  return toPdfBlob(await merged.save());
}

export type PageEdit = {
  /** Zero-based page indices to keep, in the order they should appear. */
  keep?: number[];
  /** Clockwise degrees to add, keyed by *original* page index. */
  rotate?: Record<number, number>;
  /** Clockwise degrees to add to every kept page — for a whole-document rotate. */
  rotateAll?: number;
};

export async function organizePdf(source: Blob, edit: PageEdit): Promise<Blob> {
  const lib = await loadPdfLib();
  const doc = await load(lib, await bytesOf(source));
  const pageCount = doc.getPageCount();

  const order = edit.keep ?? doc.getPageIndices();
  const valid = order.filter((index) => index >= 0 && index < pageCount);

  if (valid.length === 0) {
    throw new OperationError("That would remove every page.");
  }

  const output = await lib.PDFDocument.create();
  const copied = await output.copyPages(doc, valid);

  for (const [position, page] of copied.entries()) {
    const originalIndex = valid[position];
    const turn = edit.rotate?.[originalIndex] ?? edit.rotateAll;

    if (turn) {
      // PDF rotation must be a multiple of 90 and is cumulative with any
      // rotation already baked into the page.
      const current = page.getRotation().angle;
      page.setRotation(lib.degrees((current + turn) % 360));
    }

    output.addPage(page);
  }

  return toPdfBlob(await output.save());
}

/**
 * Clears document metadata.
 *
 * Two distinct places hold it: the Info dictionary (Title, Author, Producer…)
 * and an XMP packet in the catalog. We remove both. Note that this does not
 * touch metadata embedded *inside* images on the page — that is a different
 * problem, and the UI should not imply otherwise.
 */
export async function stripPdfMetadata(source: Blob): Promise<Blob> {
  const lib = await loadPdfLib();
  const doc = await load(lib, await bytesOf(source));

  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("");
  doc.setCreator("");

  // XMP survives the setters above, so drop the stream from the catalog.
  try {
    doc.catalog.delete(lib.PDFName.of("Metadata"));
  } catch {
    // Not all documents carry an XMP packet; nothing to do.
  }

  return toPdfBlob(await doc.save());
}

/** Formats pdf-lib can embed directly. Anything else is re-encoded to JPEG. */
export const EMBEDDABLE = new Set(["image/jpeg", "image/png"]);

export type EmbeddableImage = { bytes: Uint8Array; mime: string };

/**
 * Builds a PDF with one image per page, each page sized to its image so nothing
 * is cropped or letterboxed.
 */
export async function imagesToPdf(
  images: readonly EmbeddableImage[],
  onProgress?: (percent: number) => void,
): Promise<Blob> {
  if (images.length === 0) throw new OperationError("No images to convert.");

  const lib = await loadPdfLib();
  const doc = await lib.PDFDocument.create();

  for (const [index, image] of images.entries()) {
    const embedded =
      image.mime === "image/png"
        ? await doc.embedPng(image.bytes)
        : await doc.embedJpg(image.bytes);

    const page = doc.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    });

    onProgress?.(Math.round(((index + 1) / images.length) * 100));
  }

  return toPdfBlob(await doc.save());
}

/**
 * Only re-encode an image XObject we can be certain we understand end to
 * end. Every one of these conditions rules out a real failure mode:
 *
 *  - Subtype must be Image, Filter must be exactly `/DCTDecode` (a plain
 *    baseline JPEG stream) — anything stacked, or a different codec
 *    (JPX/CCITT/Flate-raw), we don't attempt to decode.
 *  - ColorSpace must be exactly `/DeviceRGB` — ICCBased and CMYK JPEGs are
 *    not reliably decodable via `createImageBitmap`, and DeviceGray would
 *    silently come back as RGB from canvas, corrupting the component count.
 *  - No SMask/Mask (transparency) and no Decode array (custom colour
 *    remapping) — a canvas round trip cannot preserve either.
 */
function isRecompressibleImage(lib: PdfLib, dict: PDFDict): boolean {
  const name = (key: string) => lib.PDFName.of(key);

  if (dict.get(name("Subtype"))?.toString() !== "/Image") return false;
  if (dict.get(name("Filter"))?.toString() !== "/DCTDecode") return false;
  if (dict.get(name("ColorSpace"))?.toString() !== "/DeviceRGB") return false;
  if (dict.get(name("BitsPerComponent"))?.toString() !== "8") return false;
  if (dict.has(name("SMask")) || dict.has(name("Mask")) || dict.has(name("Decode"))) return false;

  return true;
}

type ImageCandidate = {
  /**
   * The image's own indirect reference. Replacing what this points to via
   * `context.assign` — rather than registering a new object and repointing
   * the XObject dict at it — is what keeps the original bytes from being
   * left behind as an unreferenced-but-still-written orphan: pdf-lib writes
   * every registered object on save regardless of reachability, so orphaning
   * one doesn't shrink the file at all, it grows it by the size of both.
   */
  ref: PDFRef;
  stream: PDFRawStream;
};

function findRecompressibleImages(lib: PdfLib, doc: PDFDocument) {
  const candidates: ImageCandidate[] = [];
  const seen = new Set<string>();

  for (const page of doc.getPages()) {
    const resources = page.node.Resources();
    const xobjects = resources?.lookupMaybe(lib.PDFName.of("XObject"), lib.PDFDict);
    if (!xobjects) continue;

    for (const [, ref] of xobjects.entries()) {
      if (!(ref instanceof lib.PDFRef)) continue;
      // The same image XObject can be shared by several pages — recompress
      // it once, not once per page that references it.
      if (seen.has(ref.toString())) continue;

      const resolved = doc.context.lookup(ref);
      if (!(resolved instanceof lib.PDFRawStream)) continue;
      if (!isRecompressibleImage(lib, resolved.dict)) continue;

      seen.add(ref.toString());
      candidates.push({ ref, stream: resolved });
    }
  }

  return candidates;
}

/**
 * Shrinks a PDF toward a byte ceiling by recompressing the photos inside it —
 * the actual weight in a large PDF is almost always its embedded images, not
 * its text or vector content, which this never touches.
 *
 * Each qualifying image gets a byte budget proportional to its share of the
 * recompressible total, then the same quality/scale search used for a
 * standalone photo (`compressToTarget`). An image is only ever replaced if
 * the result is smaller than what was there — never larger. If nothing in
 * the document qualifies, the original bytes are returned unchanged: an
 * honest "no change" is better than a compressor that silently does nothing
 * and calls it a win.
 */
export async function compressPdf(
  source: Blob,
  maxBytes: number,
  hooks: {
    onProgress?: (percent: number) => void;
    isCancelled?: () => boolean;
  } = {},
): Promise<Blob> {
  const { onProgress, isCancelled } = hooks;
  const lib = await loadPdfLib();
  const doc = await load(lib, await bytesOf(source));

  const candidates = findRecompressibleImages(lib, doc);
  if (candidates.length === 0) return source;

  const originalTotal = candidates.reduce((sum, c) => sum + c.stream.getContentsSize(), 0);
  const overhead = source.size - originalTotal;
  // What the images collectively need to add up to. If the non-image parts
  // of the document already exceed the target, there is no budget left —
  // compress as hard as the quality/scale floor allows and let the proof
  // panel report the honest shortfall.
  const imageBudget = Math.max(maxBytes - overhead, candidates.length * 4_000);

  for (const [index, candidate] of candidates.entries()) {
    if (isCancelled?.()) throw new CancelledError();

    const originalBytes = candidate.stream.getContents();
    const share = originalBytes.length / originalTotal;
    const perImageTarget = Math.max(Math.round(imageBudget * share), 2_000);

    const bitmap = await createImageBitmap(
      new Blob([originalBytes.slice().buffer as ArrayBuffer], { type: "image/jpeg" }),
    );

    try {
      const result = await compressToTarget(bitmap, "image/jpeg", perImageTarget, {
        isCancelled,
        onProgress: (percent) =>
          onProgress?.(Math.round(((index + percent / 100) / candidates.length) * 100)),
      });

      const newBytes = new Uint8Array(await result.blob.arrayBuffer());
      if (newBytes.length >= originalBytes.length) continue;

      const newDict = candidate.stream.dict.clone(doc.context);
      newDict.set(lib.PDFName.of("Length"), lib.PDFNumber.of(newBytes.length));
      newDict.set(lib.PDFName.of("Width"), lib.PDFNumber.of(result.size.width));
      newDict.set(lib.PDFName.of("Height"), lib.PDFNumber.of(result.size.height));

      const newStream = lib.PDFRawStream.of(newDict, newBytes);
      doc.context.assign(candidate.ref, newStream);
    } finally {
      bitmap.close();
    }
  }

  return toPdfBlob(await doc.save());
}
