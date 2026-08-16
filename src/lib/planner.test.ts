import { describe, expect, it } from "vitest";
import { buildPlan } from "@/lib/planner";
import type { FileAnalysis } from "@/lib/analyze";

const analysis = (overrides: Partial<FileAnalysis> = {}): FileAnalysis => ({
  name: "file.jpg",
  size: 7_800_000,
  extension: "jpg",
  kind: "jpeg",
  extensionMismatch: false,
  width: 4032,
  height: 3024,
  hasGpsMetadata: false,
  findings: [],
  ...overrides,
});

const ids = (steps: { id: string }[]) => steps.map((step) => step.id);

describe("buildPlan", () => {
  it("plans the worked HEIC example in the correct order", () => {
    const steps = buildPlan({
      analysis: analysis({ kind: "heic", name: "IMG_8721.HEIC", hasGpsMetadata: true }),
      requirement: { maxBytes: 2_000_000 },
    });

    // Convert must precede compress: quality depends on the final format.
    expect(ids(steps)).toEqual(["convert", "strip-metadata", "compress"]);
    expect(steps[0].tool).toBe("heic-to-jpg");
  });

  it("always compresses last", () => {
    const steps = buildPlan({
      analysis: analysis({ kind: "heic" }),
      requirement: { maxBytes: 1_000_000, format: "jpg", maxWidth: 1000, stripMetadata: true },
    });
    expect(steps.at(-1)?.id).toBe("compress");
  });

  it("removes the background before resizing, so the cutout runs at full resolution", () => {
    const steps = buildPlan({
      analysis: analysis(),
      requirement: { maxWidth: 1000 },
      actions: ["remove-background"],
    });
    expect(ids(steps)).toEqual(["remove-background", "resize"]);
  });

  it("skips conversion when the file is already the target format", () => {
    const steps = buildPlan({
      analysis: analysis({ kind: "pdf", extension: "pdf", size: 900_000 }),
      requirement: { format: "pdf", maxBytes: 2_000_000 },
    });
    expect(steps).toHaveLength(0);
  });

  it("skips compression when the file is already under the limit", () => {
    const steps = buildPlan({
      analysis: analysis({ size: 500_000 }),
      requirement: { maxBytes: 2_000_000 },
    });
    expect(ids(steps)).not.toContain("compress");
  });

  it("still compresses when a format change could grow the file again", () => {
    const steps = buildPlan({
      analysis: analysis({ size: 500_000 }),
      requirement: { maxBytes: 2_000_000, format: "png" },
    });
    expect(ids(steps)).toContain("compress");
  });

  it("adds metadata removal when GPS is detected, even without being asked", () => {
    const steps = buildPlan({
      analysis: analysis({ hasGpsMetadata: true }),
      requirement: {},
    });
    expect(ids(steps)).toEqual(["strip-metadata"]);
    // Not demanded by the destination, so the user may switch it off.
    expect(steps[0].optional).toBe(true);
  });

  it("marks metadata removal required when the requirement demands it", () => {
    const steps = buildPlan({
      analysis: analysis(),
      requirement: { stripMetadata: true },
    });
    expect(steps[0].optional).toBe(false);
  });

  it("flags upscaling as cloud work and says it cannot add real detail", () => {
    const steps = buildPlan({
      analysis: analysis({ width: 800, height: 800 }),
      requirement: { minWidth: 2000, minHeight: 2000 },
    });
    expect(steps[0].id).toBe("upscale");
    expect(steps[0].processing).toBe("cloud");
    expect(steps[0].reason).toMatch(/cannot add real detail/i);
  });

  it("produces nothing when there is no requirement and no problem", () => {
    expect(buildPlan({ analysis: analysis({ size: 100_000 }), requirement: {} })).toHaveLength(0);
  });
});
