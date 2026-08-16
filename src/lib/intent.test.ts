import { describe, expect, it } from "vitest";
import { parseIntent } from "@/lib/intent";

describe("parseIntent", () => {
  it("reads a size ceiling and implies compression", () => {
    const result = parseIntent("make this under 2MB");
    expect(result.requirement.maxBytes).toBe(2_000_000);
    expect(result.actions).toContain("compress");
    expect(result.confidence).toBe("high");
  });

  it("handles fractional sizes and kilobytes", () => {
    expect(parseIntent("less than 1.5 mb").requirement.maxBytes).toBe(1_500_000);
    expect(parseIntent("under 500kb").requirement.maxBytes).toBe(500_000);
  });

  it("reads the target format, normalising jpeg to jpg", () => {
    expect(parseIntent("convert to jpeg").requirement.format).toBe("jpg");
    expect(parseIntent("I need a PDF").requirement.format).toBe("pdf");
  });

  it("reads exact dimensions written either way", () => {
    const cross = parseIntent("resize to 1280x720");
    expect(cross.requirement.exactWidth).toBe(1280);
    expect(cross.requirement.exactHeight).toBe(720);

    const by = parseIntent("600 by 600 please");
    expect(by.requirement.exactWidth).toBe(600);
  });

  it("treats a location mention as a metadata requirement", () => {
    const result = parseIntent("remove the location from this photo");
    expect(result.requirement.stripMetadata).toBe(true);
    expect(result.actions).toContain("strip-metadata");
  });

  it("recognises destinations", () => {
    expect(parseIntent("for my job application").destination).toBe("job-application");
    expect(parseIntent("small enough to email").destination).toBe("email");
    expect(parseIntent("make these ready for Etsy").destination).toBe("etsy");
  });

  it("parses the full worked example end to end", () => {
    const result = parseIntent("Make my resume under 2 MB as a PDF for a job application");
    expect(result.requirement.maxBytes).toBe(2_000_000);
    expect(result.requirement.format).toBe("pdf");
    expect(result.destination).toBe("job-application");
    expect(result.confidence).toBe("high");
  });

  it("reports no confidence on input it did not understand", () => {
    const result = parseIntent("asdfgh qwerty");
    expect(result.confidence).toBe("none");
    expect(result.matched).toHaveLength(0);
  });

  it("returns an empty requirement for empty input", () => {
    const result = parseIntent("   ");
    expect(result.requirement).toEqual({});
    expect(result.confidence).toBe("none");
  });
});
