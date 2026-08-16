/**
 * Client-side file diagnosis (plan.md §4.3).
 *
 * Everything here runs in the browser against the file's own bytes — nothing is
 * uploaded. Detection is signature-based rather than extension-based, which is
 * both the §13 security requirement and the only way to catch the very common
 * "renamed .heic to .jpg" case.
 */

import { fileExtension } from "@/lib/format";

export type DetectedKind =
  | "pdf"
  | "jpeg"
  | "png"
  | "gif"
  | "webp"
  | "heic"
  | "avif"
  | "tiff"
  | "ooxml"
  | "unknown";

export type FindingLevel = "info" | "warning";

export type Finding = {
  id: string;
  level: FindingLevel;
  title: string;
  detail: string;
  /** Registry slug of the tool that resolves this finding. */
  fix?: string;
};

export type FileAnalysis = {
  name: string;
  size: number;
  extension: string;
  kind: DetectedKind;
  /** True when the extension disagrees with the actual file signature. */
  extensionMismatch: boolean;
  width: number | null;
  height: number | null;
  /** PDFs only. null when the document could not be opened (e.g. encrypted). */
  pageCount: number | null;
  /** null when the format could not be inspected for metadata. */
  hasGpsMetadata: boolean | null;
  findings: Finding[];
};

const KIND_LABELS: Record<DetectedKind, string> = {
  pdf: "PDF",
  jpeg: "JPEG image",
  png: "PNG image",
  gif: "GIF image",
  webp: "WebP image",
  heic: "HEIC/HEIF image",
  avif: "AVIF image",
  tiff: "TIFF image",
  ooxml: "Office document",
  unknown: "Unrecognised file",
};

export function kindLabel(kind: DetectedKind): string {
  return KIND_LABELS[kind];
}

/** Extensions we consider consistent with each detected signature. */
const KIND_EXTENSIONS: Record<DetectedKind, readonly string[]> = {
  pdf: ["pdf"],
  jpeg: ["jpg", "jpeg", "jpe"],
  png: ["png"],
  gif: ["gif"],
  webp: ["webp"],
  heic: ["heic", "heif"],
  avif: ["avif"],
  tiff: ["tif", "tiff"],
  ooxml: ["docx", "xlsx", "pptx", "zip"],
  unknown: [],
};

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0) {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

function ascii(bytes: Uint8Array, offset: number, length: number) {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += String.fromCharCode(bytes[offset + i] ?? 0);
  }
  return out;
}

/** Magic-byte sniffing over the first bytes of the file. */
export function detectKind(bytes: Uint8Array): DetectedKind {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return "pdf"; // %PDF
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (ascii(bytes, 0, 3) === "GIF") return "gif";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return "webp";

  // ISO-BMFF container: the brand at offset 8 distinguishes HEIC from AVIF.
  if (ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4).toLowerCase();
    if (["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand)) return "heic";
    if (brand === "avif" || brand === "avis") return "avif";
  }

  if (startsWith(bytes, [0x49, 0x49, 0x2a, 0x00])) return "tiff"; // little-endian
  if (startsWith(bytes, [0x4d, 0x4d, 0x00, 0x2a])) return "tiff"; // big-endian
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) return "ooxml";

  return "unknown";
}

/**
 * Looks for a GPSInfo IFD (tag 0x8825) inside a JPEG's Exif APP1 segment.
 *
 * Returns null when the question cannot be answered from these bytes — the UI
 * must not claim a photo is clean when we simply could not read it.
 */
export function detectJpegGps(bytes: Uint8Array): boolean | null {
  if (!startsWith(bytes, [0xff, 0xd8, 0xff])) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;

  // Walk JPEG marker segments looking for APP1/Exif.
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return null; // desynchronised — give up honestly
    const marker = bytes[offset + 1];

    // Start of scan: image data begins, no more metadata segments follow.
    if (marker === 0xda || marker === 0xd9) return false;

    const segmentLength = view.getUint16(offset + 2, false);
    if (segmentLength < 2) return null;

    if (marker === 0xe1 && ascii(bytes, offset + 4, 4) === "Exif") {
      return gpsTagInIfd0(view, bytes, offset + 10, segmentLength - 8);
    }

    offset += 2 + segmentLength;
  }

  return false;
}

/** `tiffStart` points at the TIFF header inside the Exif payload. */
function gpsTagInIfd0(
  view: DataView,
  bytes: Uint8Array,
  tiffStart: number,
  available: number,
): boolean | null {
  if (tiffStart + 8 > bytes.length) return null;

  const byteOrder = ascii(bytes, tiffStart, 2);
  const littleEndian = byteOrder === "II";
  if (!littleEndian && byteOrder !== "MM") return null;

  const ifdOffset = view.getUint32(tiffStart + 4, littleEndian);
  const ifdStart = tiffStart + ifdOffset;
  if (ifdStart + 2 > bytes.length || ifdOffset > available) return null;

  const entryCount = view.getUint16(ifdStart, littleEndian);
  for (let i = 0; i < entryCount; i += 1) {
    const entry = ifdStart + 2 + i * 12;
    if (entry + 12 > bytes.length) return null;
    // 0x8825 = GPSInfo pointer.
    if (view.getUint16(entry, littleEndian) === 0x8825) return true;
  }

  return false;
}

async function readDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  if (typeof createImageBitmap !== "function") return null;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    return { width, height };
  } catch {
    // Formats the browser cannot decode (commonly HEIC) land here.
    return null;
  }
}

/**
 * Page count via pdf-lib, loaded on demand.
 *
 * A PDF whose only reported property is its size makes the diagnosis panel look
 * empty, and page count is the first thing anyone wants to know.
 */
async function readPdfPageCount(file: File): Promise<number | null> {
  try {
    const { readPageCount } = await import("@/lib/ops/pdf");
    return await readPageCount(file);
  } catch {
    return null;
  }
}

/** Reading a fixed head is enough for signatures and Exif, and stays cheap. */
const HEAD_BYTES = 128 * 1024;

export async function analyzeFile(file: File): Promise<FileAnalysis> {
  const head = new Uint8Array(await file.slice(0, HEAD_BYTES).arrayBuffer());
  const kind = detectKind(head);
  const extension = fileExtension(file.name);

  const allowed = KIND_EXTENSIONS[kind];
  const extensionMismatch =
    kind !== "unknown" && extension.length > 0 && !allowed.includes(extension);

  const dimensions = kind === "pdf" || kind === "ooxml" ? null : await readDimensions(file);
  const hasGpsMetadata = kind === "jpeg" ? detectJpegGps(head) : null;

  // pdf-lib is ~350 KB, so it loads only when there is actually a PDF to read.
  const pageCount = kind === "pdf" ? await readPdfPageCount(file) : null;

  return {
    name: file.name,
    size: file.size,
    extension,
    kind,
    extensionMismatch,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
    pageCount,
    hasGpsMetadata,
    findings: buildFindings({ kind, size: file.size, extensionMismatch, hasGpsMetadata }),
  };
}

/** Upload limits users actually hit: most web forms cap around 2 MB. */
const LARGE_FILE_BYTES = 2_000_000;

function buildFindings(input: {
  kind: DetectedKind;
  size: number;
  extensionMismatch: boolean;
  hasGpsMetadata: boolean | null;
}): Finding[] {
  const findings: Finding[] = [];

  if (input.kind === "heic") {
    findings.push({
      id: "heic-compatibility",
      level: "warning",
      title: "HEIC may not open everywhere",
      detail:
        "Windows, many websites and older apps cannot read HEIC photos from iPhone.",
      fix: "heic-to-jpg",
    });
  }

  if (input.size > LARGE_FILE_BYTES) {
    findings.push({
      id: "large-file",
      level: "warning",
      title: "Larger than a typical 2 MB upload limit",
      detail: "Forms, job portals and email attachments often reject files this size.",
      fix: input.kind === "pdf" ? "compress-pdf-under-2mb" : "image-under-2mb",
    });
  }

  if (input.hasGpsMetadata === true) {
    findings.push({
      id: "gps-metadata",
      level: "warning",
      title: "Contains GPS location data",
      detail: "This photo records where it was taken. Sharing it shares that location.",
      fix: "remove-location-from-photo",
    });
  }

  if (input.extensionMismatch) {
    findings.push({
      id: "extension-mismatch",
      level: "warning",
      title: "File name does not match its real format",
      detail: "Renaming a file does not convert it, and uploads often fail because of it.",
    });
  }

  if (input.kind === "unknown") {
    findings.push({
      id: "unknown-format",
      level: "info",
      title: "Format not recognised",
      detail: "We could not identify this file from its contents.",
    });
  }

  return findings;
}
