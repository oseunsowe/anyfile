/**
 * PDF operations, built on pdf-lib (MIT).
 *
 * Scope is deliberately narrower than the tool list. pdf-lib manipulates a PDF's
 * structure — pages, ordering, metadata — but it cannot re-encode the images
 * inside one. So merging, reordering and metadata removal are real here, while
 * "compress PDF" is not, and is not offered. Shipping a compressor that saves
 * two percent and calls it done would be exactly the kind of claim this product
 * exists to avoid.
 *
 * pdf-lib is ~350 KB, so it is dynamically imported and never lands in the
 * initial payload (plan.md §14).
 */

import { OperationError } from "@/lib/ops/errors";

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
    const turn = edit.rotate?.[originalIndex];

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
