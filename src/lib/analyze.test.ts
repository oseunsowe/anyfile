import { describe, expect, it } from "vitest";
import { detectJpegGps, detectKind } from "@/lib/analyze";
import { formatBytes, formatReduction } from "@/lib/format";

/** Builds a byte array from a signature plus padding. */
function bytes(...values: number[]): Uint8Array {
  const out = new Uint8Array(64);
  out.set(values);
  return out;
}

function ascii(text: string, offset = 0): number[] {
  return [...Array<number>(offset).fill(0), ...[...text].map((char) => char.charCodeAt(0))];
}

describe("detectKind", () => {
  it("identifies formats from their signatures", () => {
    expect(detectKind(bytes(0x25, 0x50, 0x44, 0x46))).toBe("pdf");
    expect(detectKind(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpeg");
    expect(detectKind(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(detectKind(bytes(...ascii("GIF89a")))).toBe("gif");
    expect(detectKind(bytes(0x49, 0x49, 0x2a, 0x00))).toBe("tiff");
    expect(detectKind(bytes(0x50, 0x4b, 0x03, 0x04))).toBe("ooxml");
  });

  it("distinguishes WebP from other RIFF containers", () => {
    const webp = new Uint8Array(64);
    webp.set(ascii("RIFF"), 0);
    webp.set(ascii("WEBP"), 8);
    expect(detectKind(webp)).toBe("webp");

    const wav = new Uint8Array(64);
    wav.set(ascii("RIFF"), 0);
    wav.set(ascii("WAVE"), 8);
    expect(detectKind(wav)).toBe("unknown");
  });

  it("separates HEIC from AVIF by ISO-BMFF brand", () => {
    const build = (brand: string) => {
      const out = new Uint8Array(64);
      out.set(ascii("ftyp"), 4);
      out.set(ascii(brand), 8);
      return out;
    };

    expect(detectKind(build("heic"))).toBe("heic");
    expect(detectKind(build("mif1"))).toBe("heic");
    expect(detectKind(build("avif"))).toBe("avif");
  });

  it("returns unknown rather than guessing", () => {
    expect(detectKind(bytes(0x00, 0x01, 0x02, 0x03))).toBe("unknown");
  });
});

describe("detectJpegGps", () => {
  /**
   * Minimal JPEG: SOI, then an APP1/Exif segment whose IFD0 holds a single tag.
   * Tag 0x8825 is the GPSInfo pointer.
   */
  function jpegWithTag(tag: number): Uint8Array {
    const exif = [
      ...ascii("Exif"),
      0x00,
      0x00,
      // TIFF header, little-endian, IFD0 at offset 8.
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
      // IFD0: one entry.
      0x01, 0x00,
      tag & 0xff, (tag >> 8) & 0xff,
      0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ];
    const length = exif.length + 2;

    return new Uint8Array([
      0xff, 0xd8, // SOI
      0xff, 0xe1, // APP1
      (length >> 8) & 0xff, length & 0xff,
      ...exif,
      0xff, 0xda, // SOS
    ]);
  }

  it("finds the GPSInfo tag", () => {
    expect(detectJpegGps(jpegWithTag(0x8825))).toBe(true);
  });

  it("reports false when Exif is present but carries no GPS tag", () => {
    expect(detectJpegGps(jpegWithTag(0x010f))).toBe(false);
  });

  it("reports false for a JPEG with no Exif segment", () => {
    expect(detectJpegGps(new Uint8Array([0xff, 0xd8, 0xff, 0xda]))).toBe(false);
  });

  it("returns null — not false — when the bytes are not a JPEG", () => {
    // The distinction matters: the UI must not claim a file is clean when it
    // simply could not be inspected.
    expect(detectJpegGps(bytes(0x25, 0x50, 0x44, 0x46))).toBeNull();
  });
});

describe("formatBytes", () => {
  it("uses decimal units, matching how upload limits are quoted", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(999)).toBe("999 B");
    expect(formatBytes(1_000)).toBe("1.0 KB");
    expect(formatBytes(2_000_000)).toBe("2.0 MB");
    expect(formatBytes(7_800_000)).toBe("7.8 MB");
  });

  it("handles nonsense input without throwing", () => {
    expect(formatBytes(-1)).toBe("—");
    expect(formatBytes(Number.NaN)).toBe("—");
  });
});

describe("formatReduction", () => {
  it("states the before, after and percentage saved", () => {
    expect(formatReduction(7_800_000, 1_870_000)).toBe("7.8 MB → 1.9 MB (76% smaller)");
  });
});
