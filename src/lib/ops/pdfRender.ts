/**
 * Rasterizes PDF pages to images, entirely in the browser — pdf.js (Apache
 * 2.0) is the only real option for this: pdf-lib manipulates a PDF's
 * structure but has no page renderer, and there is no server in this build
 * to do it for us. Runs on the main thread rather than our own pipeline
 * worker: pdf.js manages its own internal worker for the heavy parsing
 * work, so nesting it inside another worker buys little and risks browsers
 * with flaky nested-worker support.
 *
 * pdfjs-dist is multiple megabytes, so it is dynamically imported and only
 * ever loaded by this one tool (plan.md §14).
 */

import { PipelineCancelled } from "@/lib/ops/client";
import { OperationError } from "@/lib/ops/errors";
import { createZip } from "@/lib/ops/zip";

type PdfJs = typeof import("pdfjs-dist");

let libPromise: Promise<PdfJs> | null = null;

async function loadPdfJs(): Promise<PdfJs> {
  libPromise ??= import("pdfjs-dist").then((lib) => {
    // Bundled asset URL, resolved the same way our own pipeline worker is —
    // see src/lib/ops/client.ts.
    lib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    return lib;
  }).catch((error) => {
    libPromise = null;
    throw error;
  });
  return libPromise;
}

/** §13 — refuse an absurd page count before we start rendering. */
const MAX_PAGES = 500;

export type PageExport = { index: number; blob: Blob };

/**
 * Renders the given zero-based page indices (all pages if omitted) to JPEG.
 * `scale` trades resolution for speed/size — 2 approximates a 144 DPI export
 * of a standard 72 DPI PDF page, which is sharp enough to read comfortably
 * without ballooning file size.
 */
export async function renderPdfPages(
  source: Blob,
  options: {
    pages?: readonly number[];
    scale?: number;
    quality?: number;
    onProgress?: (percent: number) => void;
    isCancelled?: () => boolean;
  } = {},
): Promise<PageExport[]> {
  const { scale = 2, quality = 0.9, onProgress, isCancelled } = options;
  const lib = await loadPdfJs();

  const data = new Uint8Array(await source.arrayBuffer());
  let doc;
  try {
    doc = await lib.getDocument({ data }).promise;
  } catch {
    throw new OperationError("That PDF could not be read — it may be damaged or password-protected.");
  }

  if (doc.numPages > MAX_PAGES) {
    throw new OperationError(`This PDF has more than ${MAX_PAGES} pages, which is too many to export at once.`);
  }

  const indices = (options.pages ?? Array.from({ length: doc.numPages }, (_, i) => i)).filter(
    (index) => index >= 0 && index < doc.numPages,
  );

  if (indices.length === 0) {
    throw new OperationError("No pages were selected to export.");
  }

  const results: PageExport[] = [];

  for (const [position, index] of indices.entries()) {
    if (isCancelled?.()) throw new PipelineCancelled();

    const page = await doc.getPage(index + 1);
    const viewport = page.getViewport({ scale });
    const canvas = new OffscreenCanvas(Math.round(viewport.width), Math.round(viewport.height));
    const context = canvas.getContext("2d");
    if (!context) throw new OperationError("Could not prepare a page for export.");

    // pdf.js expects DOM canvas types in its public signature, but has
    // supported OffscreenCanvas/OffscreenCanvasRenderingContext2D at runtime
    // for years — the documented pattern for rendering off the main document.
    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;

    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    results.push({ index, blob });

    onProgress?.(Math.round(((position + 1) / indices.length) * 100));
  }

  return results;
}

function pageFilename(baseName: string, index: number, total: number): string {
  const dot = baseName.lastIndexOf(".");
  const stem = dot > 0 ? baseName.slice(0, dot) : baseName;
  const digits = String(total).length;
  return `${stem}-page-${String(index + 1).padStart(digits, "0")}.jpg`;
}

/**
 * The tool-facing entry point: renders the requested pages and packages the
 * result the way a person expects to receive it — one JPEG file if that's
 * all there is, or a single zip if there are several, rather than triggering
 * a multi-file browser download.
 */
export async function exportPdfPagesAsImages(
  source: Blob,
  baseName: string,
  options: {
    pages?: readonly number[];
    onProgress?: (percent: number) => void;
    isCancelled?: () => boolean;
  } = {},
): Promise<{ blob: Blob; filename: string }> {
  const pages = await renderPdfPages(source, options);

  if (pages.length === 1) {
    return { blob: pages[0].blob, filename: pageFilename(baseName, pages[0].index, pages.length) };
  }

  const files = await Promise.all(
    pages.map(async (page) => ({
      name: pageFilename(baseName, page.index, pages.length),
      bytes: new Uint8Array(await page.blob.arrayBuffer()),
    })),
  );

  const dot = baseName.lastIndexOf(".");
  const stem = dot > 0 ? baseName.slice(0, dot) : baseName;

  return { blob: createZip(files), filename: `${stem}-pages.zip` };
}
