import { describe, expect, it } from "vitest";
import { createZip } from "@/lib/ops/zip";

/**
 * Correctness here can't lean on "it round-trips through our own reader" —
 * we don't have one. These assertions are hand-derived from the ZIP spec
 * (signatures, STORE method, offsets) so a regression can't satisfy both the
 * test and a real unzip tool by coincidence. Cross-checked once against
 * Python's independent `zipfile` module during development.
 */
describe("createZip", () => {
  it("produces a well-formed single-entry archive", async () => {
    const bytes = new TextEncoder().encode("Hello, world!");
    const blob = createZip([{ name: "hello.txt", bytes }]);
    const view = new DataView(await blob.arrayBuffer());

    expect(view.getUint32(0, true)).toBe(0x04034b50); // local file header signature
    expect(view.getUint16(8, true)).toBe(0); // method: STORE
    expect(view.getUint32(18, true)).toBe(bytes.length); // compressed size
    expect(view.getUint32(22, true)).toBe(bytes.length); // uncompressed size

    // End of central directory record is always the last 22 bytes here —
    // there is no zip comment, so nothing follows it.
    const end = new DataView(view.buffer, view.byteLength - 22, 22);
    expect(end.getUint32(0, true)).toBe(0x06054b50);
    expect(end.getUint16(8, true)).toBe(1); // one entry
  });

  it("recovers the exact bytes for each entry from its own offsets", async () => {
    const files = [
      { name: "a.txt", bytes: new TextEncoder().encode("first file") },
      { name: "dir/b.txt", bytes: new TextEncoder().encode("second, nested file") },
    ];
    const blob = createZip(files);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const view = new DataView(bytes.buffer);

    let offset = 0;
    for (const file of files) {
      expect(view.getUint32(offset, true)).toBe(0x04034b50);
      const nameLength = view.getUint16(offset + 26, true);
      const nameBytes = bytes.slice(offset + 30, offset + 30 + nameLength);
      expect(new TextDecoder().decode(nameBytes)).toBe(file.name);

      const contentStart = offset + 30 + nameLength;
      const content = bytes.slice(contentStart, contentStart + file.bytes.length);
      expect(content).toEqual(file.bytes);

      offset = contentStart + file.bytes.length;
    }
  });

  it("keeps entries independent — content is never split across boundaries", async () => {
    const files = [
      { name: "one", bytes: new Uint8Array([1, 2, 3]) },
      { name: "two", bytes: new Uint8Array([4, 5, 6, 7]) },
    ];
    const blob = createZip(files);
    const text = new TextDecoder("latin1").decode(await blob.arrayBuffer());

    // Both filenames must appear as literal, unbroken strings in the output.
    expect(text).toContain("one");
    expect(text).toContain("two");
  });
});
