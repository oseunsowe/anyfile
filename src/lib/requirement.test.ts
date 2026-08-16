import { describe, expect, it } from "vitest";
import {
  describeRequirement,
  evaluateRequirement,
  overallStatus,
  type OutputFacts,
} from "@/lib/requirement";

const measured = (overrides: Partial<OutputFacts> = {}): OutputFacts => ({
  bytes: 1_800_000,
  format: "pdf",
  width: null,
  height: null,
  metadataStripped: true,
  ...overrides,
});

describe("evaluateRequirement", () => {
  it("passes a file that meets every stated constraint", () => {
    const checks = evaluateRequirement(
      { format: "pdf", maxBytes: 2_000_000, stripMetadata: true },
      measured(),
    );
    expect(overallStatus(checks)).toBe("pass");
  });

  it("fails when the file is over the size ceiling", () => {
    const checks = evaluateRequirement({ maxBytes: 2_000_000 }, measured({ bytes: 2_400_000 }));
    expect(checks[0].status).toBe("fail");
    expect(overallStatus(checks)).toBe("fail");
  });

  it("treats the ceiling as inclusive", () => {
    const checks = evaluateRequirement({ maxBytes: 2_000_000 }, measured({ bytes: 2_000_000 }));
    expect(checks[0].status).toBe("pass");
  });

  it("never reports a pass for something it could not measure", () => {
    const checks = evaluateRequirement({ maxBytes: 2_000_000 }, measured({ bytes: null }));
    expect(checks[0].status).toBe("unknown");
    expect(overallStatus(checks)).toBe("unknown");
  });

  it("lets a real failure outrank an unmeasured constraint", () => {
    const checks = evaluateRequirement(
      { maxBytes: 1_000_000, format: "pdf" },
      measured({ bytes: 2_000_000, format: null }),
    );
    expect(overallStatus(checks)).toBe("fail");
  });

  it("checks exact dimensions", () => {
    const pass = evaluateRequirement(
      { exactWidth: 1280, exactHeight: 720 },
      measured({ width: 1280, height: 720 }),
    );
    expect(pass[0].status).toBe("pass");

    const fail = evaluateRequirement(
      { exactWidth: 1280, exactHeight: 720 },
      measured({ width: 1280, height: 800 }),
    );
    expect(fail[0].status).toBe("fail");
  });

  it("checks minimum dimensions", () => {
    const checks = evaluateRequirement(
      { minWidth: 2000, minHeight: 2000 },
      measured({ width: 1500, height: 2400 }),
    );
    expect(checks[0].status).toBe("fail");
  });

  it("produces no checks for an empty requirement, and no verdict", () => {
    const checks = evaluateRequirement({}, measured());
    expect(checks).toHaveLength(0);
    expect(overallStatus(checks)).toBe("unknown");
  });
});

describe("describeRequirement", () => {
  it("summarises a requirement in one line", () => {
    expect(describeRequirement({ format: "pdf", maxBytes: 2_000_000 })).toBe("PDF · max 2 MB");
  });

  it("includes metadata removal", () => {
    expect(describeRequirement({ stripMetadata: true })).toBe("metadata removed");
  });
});
