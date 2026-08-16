import { describe, expect, it, vi } from "vitest";
import { CancelledError, searchQuality } from "@/lib/ops/quality";
import { scaleBy, targetSize } from "@/lib/ops/resize";

/**
 * Stand-in encoder. Size falls as quality falls, which is the monotonicity the
 * binary search depends on.
 */
function fakeEncoder(bytesAtFullQuality: number) {
  return async (quality: number) => ({
    size: Math.round(bytesAtFullQuality * quality),
    quality,
  });
}

describe("searchQuality", () => {
  it("returns immediately when the file already fits at max quality", async () => {
    const encode = vi.fn(fakeEncoder(1_000_000));
    const found = await searchQuality({ encode, maxBytes: 2_000_000 });

    expect(found?.quality).toBe(0.95);
    // One probe only — a file that already fits must not be degraded.
    expect(encode).toHaveBeenCalledTimes(1);
  });

  it("finds the highest quality that still fits", async () => {
    const found = await searchQuality({
      encode: fakeEncoder(10_000_000),
      maxBytes: 5_000_000,
    });

    expect(found).not.toBeNull();
    expect(found!.result.size).toBeLessThanOrEqual(5_000_000);
    // Optimal is q=0.5; six halvings should land close under it.
    expect(found!.quality).toBeGreaterThan(0.46);
    expect(found!.quality).toBeLessThanOrEqual(0.5);
  });

  it("never returns a result over the ceiling", async () => {
    for (const target of [100, 999_999, 3_300_000, 9_000_000]) {
      const found = await searchQuality({
        encode: fakeEncoder(10_000_000),
        maxBytes: target,
      });
      if (found) expect(found.result.size).toBeLessThanOrEqual(target);
    }
  });

  it("returns null when even the lowest quality is too large", async () => {
    // At min quality 0.3 this still yields 3 MB, over the 1 MB ceiling.
    const found = await searchQuality({
      encode: fakeEncoder(10_000_000),
      maxBytes: 1_000_000,
    });
    expect(found).toBeNull();
  });

  it("reports progress on every attempt", async () => {
    const onAttempt = vi.fn();
    await searchQuality({
      encode: fakeEncoder(10_000_000),
      maxBytes: 5_000_000,
      onAttempt,
    });
    expect(onAttempt).toHaveBeenCalledTimes(7); // initial probe + 6 halvings
  });

  it("stops when cancelled", async () => {
    const encode = vi.fn(fakeEncoder(10_000_000));
    let calls = 0;

    await expect(
      searchQuality({
        encode,
        maxBytes: 1_000,
        isCancelled: () => ++calls > 2,
      }),
    ).rejects.toBeInstanceOf(CancelledError);

    expect(encode.mock.calls.length).toBeLessThan(7);
  });
});

describe("targetSize", () => {
  it("returns null when the image already complies", () => {
    expect(targetSize({ width: 800, height: 600 }, { maxWidth: 1000 })).toBeNull();
    expect(
      targetSize({ width: 1280, height: 720 }, { exactWidth: 1280, exactHeight: 720 }),
    ).toBeNull();
  });

  it("preserves aspect ratio when shrinking to a max bound", () => {
    const size = targetSize({ width: 4000, height: 3000 }, { maxWidth: 2000 });
    expect(size).toEqual({ width: 2000, height: 1500 });
  });

  it("respects whichever bound binds first", () => {
    const size = targetSize({ width: 4000, height: 3000 }, { maxWidth: 2000, maxHeight: 1000 });
    expect(size).toEqual({ width: 1333, height: 1000 });
  });

  it("never enlarges to meet a maximum", () => {
    expect(targetSize({ width: 500, height: 400 }, { maxWidth: 4000 })).toBeNull();
  });

  it("honours an exact target literally, even against the aspect ratio", () => {
    const size = targetSize({ width: 4000, height: 3000 }, { exactWidth: 1280, exactHeight: 720 });
    expect(size).toEqual({ width: 1280, height: 720 });
  });

  it("never produces a zero dimension", () => {
    const size = targetSize({ width: 4000, height: 3 }, { maxWidth: 10 });
    expect(size!.height).toBeGreaterThanOrEqual(1);
  });
});

describe("scaleBy", () => {
  it("scales both axes and floors at one pixel", () => {
    expect(scaleBy({ width: 1000, height: 800 }, 0.5)).toEqual({ width: 500, height: 400 });
    expect(scaleBy({ width: 2, height: 2 }, 0.01)).toEqual({ width: 1, height: 1 });
  });
});
