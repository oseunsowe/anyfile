import { chromium } from "playwright";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://localhost:3000";
let failures = 0;
let skipped = 0;

const FIXTURE_DIR = path.join(import.meta.dirname, ".fixtures");
/** Nokia's public HEIF conformance suite — a genuine camera-style HEIC file. */
const HEIC_URL =
  "https://github.com/nokiatech/heif_conformance/raw/master/conformance_files/C003.heic";

/**
 * Fetched on demand and cached, rather than committed: it is a third-party
 * binary and the repo should not carry one. If it cannot be obtained we SKIP
 * loudly — a silently-passing HEIC suite would be worse than none.
 */
async function heicFixture() {
  const file = path.join(FIXTURE_DIR, "sample.heic");
  if (fs.existsSync(file)) return fs.readFileSync(file);

  try {
    const response = await fetch(HEIC_URL, { signal: AbortSignal.timeout(45000) });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(FIXTURE_DIR, { recursive: true });
    fs.writeFileSync(file, buffer);
    return buffer;
  } catch {
    return null;
  }
}

function skip(name, why) {
  console.log(`SKIP  ${name} — ${why}`);
  skipped += 1;
}

function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
}

function info(name, detail) {
  console.log(`INFO  ${name} — ${detail}`);
}

/**
 * Visibility with a wait. Elements fade in over ~200ms, so an instantaneous
 * `isVisible()` races the animation and reports a false negative.
 */
async function visible(locator, timeout = 5000) {
  try {
    await locator.waitFor({ state: "visible", timeout });
    return true;
  } catch {
    return false;
  }
}

/** Generate a genuinely large, hard-to-compress JPEG using the browser itself. */
async function makeNoisyJpeg(page, width, height) {
  const dataUrl = await page.evaluate(
    async ([w, h]) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      const image = ctx.createImageData(w, h);
      // Pseudo-random noise: incompressible, so quality search has real work.
      let seed = 12345;
      for (let i = 0; i < image.data.length; i += 4) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        image.data[i] = seed & 0xff;
        image.data[i + 1] = (seed >> 8) & 0xff;
        image.data[i + 2] = (seed >> 16) & 0xff;
        image.data[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.98);
    },
    [width, height],
  );
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

/** A flat-colour JPEG via canvas — no need for noise when size isn't the point. */
async function makeFlatJpeg(page, width, height, color) {
  const dataUrl = await page.evaluate(
    async ([w, h, c]) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, w, h);
      return canvas.toDataURL("image/jpeg", 0.9);
    },
    [width, height, color],
  );
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

/** A minimal real PDF, built with pdf-lib in Node — no browser needed for this one. */
async function makeSimplePdf({ pages = 1, width = 200, height = 300, title, author } = {}) {
  const doc = await PDFDocument.create();
  if (title) doc.setTitle(title);
  if (author) doc.setAuthor(author);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i += 1) {
    const page = doc.addPage([width, height]);
    page.drawText(`Page ${i + 1}`, { x: 20, y: height - 40, size: 14, font });
  }

  return Buffer.from(await doc.save());
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto(BASE, { waitUntil: "networkidle" });

/** All assertions are scoped to the console so FAQ copy cannot match. */
const console_ = page.getByTestId("smartfix-console");
const VERDICT = /Requirement met|Requirement not met|Not fully verified/;

const jpeg = await makeNoisyJpeg(page, 2400, 1800);
console.log(`\nGenerated source JPEG: ${(jpeg.length / 1000).toFixed(1)} KB\n`);
check("source is large enough to require compression", jpeg.length > 800_000);

// ---------------------------------------------------------------------------
// Scenario 1 — exact-size compression
// ---------------------------------------------------------------------------
console.log("Scenario 1: 'Make this under 500 KB as JPG'");

await page.fill("#outcome", "Make this under 500 KB as JPG");
const interpreted = await visible(console_.getByText(/JPG\s*·\s*max\s*500\s*KB/i), 4000);
check("intent parsed and echoed back", interpreted);

await console_.locator('input[type="file"]').setInputFiles({
  name: "noise.jpg",
  mimeType: "image/jpeg",
  buffer: jpeg,
});

await Promise.race([
  console_.getByText(/We found \d+ issue/).waitFor({ timeout: 15000 }),
  console_.getByText(/No problems found/i).waitFor({ timeout: 15000 }),
]);
check("diagnosis shown", true);

const planText = await console_.locator("ol").first().innerText();
check("plan contains a compression step", /Compress to 500 KB or less/i.test(planText));

await console_.getByRole("button", { name: /Run this plan/i }).click();
await console_.getByText(VERDICT).waitFor({ timeout: 60000 });

const verdict = await console_.getByText(VERDICT).innerText();
check("verdict is PASS", verdict.includes("Requirement met"), verdict);

const proof = await console_.innerText();

// Capture the ACTUAL column, which follows the "Required:" line — matching the
// first number after "File size" would just re-read the requirement itself.
const sizeRow = proof.match(/File size[\s\S]*?Required:[^\n]*\n\s*([\d.]+)\s*(KB|MB|B)\b/);
check("proof reports the measured output size", Boolean(sizeRow), sizeRow?.[1] + sizeRow?.[2]);

if (sizeRow) {
  const value = Number.parseFloat(sizeRow[1]);
  const bytes = value * (sizeRow[2] === "MB" ? 1e6 : sizeRow[2] === "KB" ? 1e3 : 1);
  check(`measured output is under 500 KB (${value} ${sizeRow[2]})`, bytes <= 500_000);
  check("compression actually did work", bytes < jpeg.length / 2);
}

const reduction = proof.match(/[\d.]+ \w+ → [\d.]+ \w+ \(\d+% smaller\)/);
check("before/after reduction shown", Boolean(reduction), reduction?.[0]);

const download = console_.getByRole("link", { name: /Download/i });
check("download link offered", await download.isVisible());
check(
  "download has a .jpg filename",
  (await download.getAttribute("download"))?.endsWith(".jpg") ?? false,
  await download.getAttribute("download"),
);

// ---------------------------------------------------------------------------
// Scenario 2 — convert + resize chain
// ---------------------------------------------------------------------------
console.log("\nScenario 2: 'Resize to 800x600 as PNG'");

await console_.getByRole("button", { name: /Fix another file/i }).click();
await page.fill("#outcome", "Resize to 800x600 as PNG");
await console_.locator('input[type="file"]').setInputFiles({
  name: "noise.jpg",
  mimeType: "image/jpeg",
  buffer: jpeg,
});

await console_.getByText(/Our plan/).waitFor({ timeout: 15000 });
const chainText = await console_.locator("ol").first().innerText();
check("plan converts before resizing", /Convert to PNG[\s\S]*Resize to 800×600/.test(chainText));

await console_.getByRole("button", { name: /Run this plan/i }).click();
await console_.getByText(VERDICT).waitFor({ timeout: 60000 });

const proof2 = await console_.innerText();
check("dimensions honoured exactly", /800×600/.test(proof2), proof2.match(/\d+×\d+/g)?.join(" "));
check("format converted to PNG", /PNG/.test(proof2));

const download2 = await console_
  .getByRole("link", { name: /Download/i })
  .getAttribute("download");
check("output renamed to .png", download2?.endsWith(".png") ?? false, download2);

// ---------------------------------------------------------------------------
// Scenario 3 — cancellation returns to a usable state
// ---------------------------------------------------------------------------
console.log("\nScenario 3: cancel a running job");

await console_.getByRole("button", { name: /Fix another file/i }).click();
await page.fill("#outcome", "Make this under 60 KB as JPG");
await console_.locator('input[type="file"]').setInputFiles({
  name: "noise.jpg",
  mimeType: "image/jpeg",
  buffer: jpeg,
});
await console_.getByText(/Our plan/).waitFor({ timeout: 15000 });
await console_.getByRole("button", { name: /Run this plan/i }).click();

const cancelButton = console_.getByRole("button", { name: /^Cancel$/ });
await cancelButton.waitFor({ timeout: 15000 });
check("progress UI appears with a cancel control", true);
await cancelButton.click();

// Cancelling must return to the plan, not to an error or a dead end.
await console_.getByRole("button", { name: /Run this plan/i }).waitFor({ timeout: 20000 });
check("cancel returns to the plan, ready to run again", true);
check("no proof panel shown after cancelling", !VERDICT.test(await console_.innerText()));

// ---------------------------------------------------------------------------
// Scenario 4 — a tool landing page runs the same pipeline, preconfigured
// ---------------------------------------------------------------------------
console.log("\nScenario 4: /image-under-2mb landing page");

await page.goto(`${BASE}/image-under-2mb`, { waitUntil: "networkidle" });
const workspace = page.getByTestId("tool-workspace");

check("page states its requirement without asking", await visible(workspace.getByText("max 2 MB")));
check("h1 is intent-specific", (await page.locator("h1").innerText()).includes("under 2 MB"));
check("breadcrumbs present", await visible(page.getByLabel("Breadcrumb")));
check("FAQ content rendered", await visible(page.getByRole("heading", { name: /Frequently asked questions/i })));
check("related tools linked", await visible(page.getByRole("heading", { name: /Related tools/i })));

const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
check("emits WebApplication structured data", jsonLd.some((s) => s.includes("WebApplication")));
check("emits BreadcrumbList structured data", jsonLd.some((s) => s.includes("BreadcrumbList")));

await workspace.locator('input[type="file"]').setInputFiles({
  name: "noise.jpg",
  mimeType: "image/jpeg",
  buffer: jpeg,
});
await workspace.getByText(/Our plan/).waitFor({ timeout: 15000 });
await workspace.getByRole("button", { name: /Run this plan|Image under 2 MB/i }).click();
await workspace.getByText(VERDICT).waitFor({ timeout: 60000 });

const proof4 = await workspace.innerText();
check("tool page reaches a PASS", /Requirement met/.test(proof4), proof4.match(VERDICT)?.[0]);

// Reported, not asserted: the displayed size is rounded to one decimal, so
// "2.0 MB" cannot distinguish 1.96 MB from 2.04 MB. The verdict above is the
// authoritative check — it is computed from the real byte count.
const size4 = proof4.match(/File size[\s\S]*?Required:[^\n]*\n\s*([\d.]+\s*(?:KB|MB|B))\b/);
if (size4) info("tool page output size", size4[1]);

// ---------------------------------------------------------------------------
// Scenario 5 — metadata removal is offered off the back of real detection
// ---------------------------------------------------------------------------
console.log("\nScenario 5: /remove-location-from-photo");

await page.goto(`${BASE}/remove-location-from-photo`, { waitUntil: "networkidle" });
const privacyTool = page.getByTestId("tool-workspace");

await privacyTool.locator('input[type="file"]').setInputFiles({
  name: "noise.jpg",
  mimeType: "image/jpeg",
  buffer: jpeg,
});
await privacyTool.getByText(/Our plan/).waitFor({ timeout: 15000 });
check(
  "plans a metadata removal step",
  /Remove private metadata/.test(await privacyTool.locator("ol").first().innerText()),
);

await privacyTool.getByRole("button", { name: /Run this plan|Remove photo location/i }).click();
await privacyTool.getByText(VERDICT).waitFor({ timeout: 60000 });
const proof5 = await privacyTool.innerText();
check("metadata reported as removed", /Removed/.test(proof5));
check("privacy tool reaches a PASS", /Requirement met/.test(proof5));

// ---------------------------------------------------------------------------
// Scenario 6 — HEIC via the WebAssembly decoder
//
// Chromium cannot decode HEIC natively, so reaching a JPG here proves the
// lazy-loaded libheif fallback genuinely works. (Safari would take the native
// path instead and never load the WASM at all.)
// ---------------------------------------------------------------------------
console.log("\nScenario 6: /heic-to-jpg via the WASM decoder");

const heic = await heicFixture();

if (!heic) {
  skip("HEIC conversion", "could not download the conformance fixture (offline?)");
} else {
  info("HEIC fixture", `${(heic.length / 1000).toFixed(1)} KB`);

  await page.goto(`${BASE}/heic-to-jpg`, { waitUntil: "networkidle" });
  const heicTool = page.getByTestId("tool-workspace");

  await heicTool.locator('input[type="file"]').setInputFiles({
    name: "IMG_8721.HEIC",
    mimeType: "image/heic",
    buffer: heic,
  });

  await heicTool.getByText(/Our plan/).waitFor({ timeout: 20000 });
  const heicDiagnosis = await heicTool.innerText();
  check("detected as HEIC from its signature", /HEIC/i.test(heicDiagnosis));
  check("plans a conversion to JPG", /Convert to JPG/i.test(heicDiagnosis));
  check(
    "explains why HEIC needs converting",
    /not readable on Windows|upload forms/i.test(heicDiagnosis),
  );

  await heicTool.getByRole("button", { name: /Run this plan|HEIC to JPG/i }).click();
  // Generous: the first run also downloads and instantiates ~1.4 MB of WASM.
  await heicTool.getByText(VERDICT).waitFor({ timeout: 120000 });

  const heicProof = await heicTool.innerText();
  check("HEIC decoded and converted", /Requirement met/.test(heicProof), heicProof.match(VERDICT)?.[0]);
  check("output reports as JPG", /JPG/.test(heicProof));

  const heicDownload = await heicTool
    .getByRole("link", { name: /Download/i })
    .getAttribute("download");
  check("output renamed to .jpg", heicDownload?.endsWith(".jpg") ?? false, heicDownload);

  // Spaces are optional: the requirement rows render "800×600" while the
  // measured-facts row renders "1440 × 960".
  const dims = heicProof.match(/(\d{2,5})\s*×\s*(\d{2,5})/);
  check(
    "decoded to real pixel dimensions",
    Boolean(dims) && Number(dims[1]) > 0 && Number(dims[2]) > 0,
    dims?.[0] ?? heicProof.replace(/\s+/g, " ").slice(0, 160),
  );
}

// ---------------------------------------------------------------------------
// Scenario 7 — merge-pdf combines an ordered, multi-file queue into one PDF
// ---------------------------------------------------------------------------
console.log("\nScenario 7: /merge-pdf combines files in order");

await page.goto(`${BASE}/merge-pdf`, { waitUntil: "networkidle" });
const mergeTool = page.getByTestId("tool-workspace");

const pdfA = await makeSimplePdf({ pages: 1 });
const pdfB = await makeSimplePdf({ pages: 2 });

await mergeTool
  .locator('input[type="file"]')
  .setInputFiles({ name: "a.pdf", mimeType: "application/pdf", buffer: pdfA });
await mergeTool.getByText(/1 file, in this order/).waitFor({ timeout: 15000 });
check(
  "run is disabled below the two-file minimum",
  await mergeTool.getByRole("button", { name: /Run this plan|Merge PDF/i }).isDisabled(),
);

await mergeTool.getByText("Add another file").waitFor({ timeout: 5000 });
await mergeTool
  .locator('input[type="file"]')
  .setInputFiles({ name: "b.pdf", mimeType: "application/pdf", buffer: pdfB });
await mergeTool.getByText(/2 files, in this order/).waitFor({ timeout: 15000 });
check(
  "plan combines the queued files in order",
  /Merge into one PDF/.test(await mergeTool.innerText()),
);
check(
  "run enabled once the minimum is met",
  await mergeTool.getByRole("button", { name: /Run this plan|Merge PDF/i }).isEnabled(),
);

const [mergeDownload] = await Promise.all([
  page.waitForEvent("download"),
  (async () => {
    await mergeTool.getByRole("button", { name: /Run this plan|Merge PDF/i }).click();
    await mergeTool.getByText(VERDICT).waitFor({ timeout: 30000 });
    await mergeTool.getByRole("link", { name: /Download/i }).click();
  })(),
]);

check(
  "merged file named for the combined document, not the first input",
  (await mergeDownload.suggestedFilename()) === "merged.pdf",
  await mergeDownload.suggestedFilename(),
);

const mergedDoc = await PDFDocument.load(fs.readFileSync(await mergeDownload.path()));
check(
  "merged PDF carries every page from both files, in order",
  mergedDoc.getPageCount() === 3,
  mergedDoc.getPageCount(),
);

// ---------------------------------------------------------------------------
// Scenario 8 — image-to-pdf builds one page per image, sized to fit
// ---------------------------------------------------------------------------
console.log("\nScenario 8: /image-to-pdf builds one page per image");

await page.goto(`${BASE}/image-to-pdf`, { waitUntil: "networkidle" });
const imageToPdfTool = page.getByTestId("tool-workspace");

const photoA = await makeFlatJpeg(page, 300, 200, "red");
const photoB = await makeFlatJpeg(page, 150, 150, "blue");

await imageToPdfTool
  .locator('input[type="file"]')
  .setInputFiles({ name: "photo-a.jpg", mimeType: "image/jpeg", buffer: photoA });
await imageToPdfTool.getByText(/1 file, in this order/).waitFor({ timeout: 15000 });

await imageToPdfTool.getByText("Add another file").waitFor({ timeout: 5000 });
await imageToPdfTool
  .locator('input[type="file"]')
  .setInputFiles({ name: "photo-b.jpg", mimeType: "image/jpeg", buffer: photoB });
await imageToPdfTool.getByText(/2 files, in this order/).waitFor({ timeout: 15000 });
check(
  "plan combines images into one PDF",
  /Combine into one PDF/.test(await imageToPdfTool.innerText()),
);

const [imagesDownload] = await Promise.all([
  page.waitForEvent("download"),
  (async () => {
    await imageToPdfTool.getByRole("button", { name: /Run this plan|Image to PDF/i }).click();
    await imageToPdfTool.getByText(VERDICT).waitFor({ timeout: 30000 });
    await imageToPdfTool.getByRole("link", { name: /Download/i }).click();
  })(),
]);

const imagesDoc = await PDFDocument.load(fs.readFileSync(await imagesDownload.path()));
check("one page per source image", imagesDoc.getPageCount() === 2, imagesDoc.getPageCount());

const firstPageSize = imagesDoc.getPage(0).getSize();
check(
  "page sized to its image rather than cropped or letterboxed",
  Math.round(firstPageSize.width) === 300 && Math.round(firstPageSize.height) === 200,
  `${firstPageSize.width}×${firstPageSize.height}`,
);

// ---------------------------------------------------------------------------
// Scenario 9 — pdf-remove-metadata actually clears document properties
// ---------------------------------------------------------------------------
console.log("\nScenario 9: /pdf-remove-metadata clears document properties");

await page.goto(`${BASE}/pdf-remove-metadata`, { waitUntil: "networkidle" });
const metadataTool = page.getByTestId("tool-workspace");

const taggedPdf = await makeSimplePdf({ title: "Confidential Draft", author: "Jane Doe" });

await metadataTool
  .locator('input[type="file"]')
  .setInputFiles({ name: "tagged.pdf", mimeType: "application/pdf", buffer: taggedPdf });
await metadataTool.getByText(/Our plan/).waitFor({ timeout: 15000 });
check(
  "plans a metadata removal step",
  /Remove private metadata/.test(await metadataTool.locator("ol").first().innerText()),
);

const [metadataDownload] = await Promise.all([
  page.waitForEvent("download"),
  (async () => {
    await metadataTool.getByRole("button", { name: /Run this plan|Remove PDF metadata/i }).click();
    await metadataTool.getByText(VERDICT).waitFor({ timeout: 30000 });
    await metadataTool.getByRole("link", { name: /Download/i }).click();
  })(),
]);

const proof9 = await metadataTool.innerText();
check("metadata removal reaches a PASS", /Requirement met/.test(proof9), proof9.match(VERDICT)?.[0]);

const cleanedDoc = await PDFDocument.load(fs.readFileSync(await metadataDownload.path()));
check("title actually cleared, not just hidden in the UI", !cleanedDoc.getTitle(), cleanedDoc.getTitle());
check("author actually cleared, not just hidden in the UI", !cleanedDoc.getAuthor(), cleanedDoc.getAuthor());

// ---------------------------------------------------------------------------
// Scenario 10 — profile-picture-resizer: destination presets, not raw pixels
// ---------------------------------------------------------------------------
console.log("\nScenario 10: /profile-picture-resizer destination presets");

await page.goto(`${BASE}/profile-picture-resizer`, { waitUntil: "networkidle" });
const profileTool = page.getByTestId("tool-workspace");

check(
  "offers a platform, not a pixel field, by default",
  await visible(profileTool.getByRole("radio", { name: "Discord" })),
);

await profileTool.getByRole("radio", { name: "Discord" }).click();
check(
  "selecting a platform explains the chosen size",
  await visible(profileTool.getByText(/512×512/)),
);

const selfie = await makeFlatJpeg(page, 300, 500, "green");
await profileTool.locator('input[type="file"]').setInputFiles({
  name: "selfie.jpg",
  mimeType: "image/jpeg",
  buffer: selfie,
});
await profileTool.getByText(/Our plan/).waitFor({ timeout: 15000 });
check(
  "plan resizes to the selected platform's square size",
  /Resize to 512×512/.test(await profileTool.innerText()),
);

await profileTool.getByRole("button", { name: /Run this plan|Profile Picture Resizer/i }).click();
await profileTool.getByText(VERDICT).waitFor({ timeout: 30000 });

const proof10 = await profileTool.innerText();
check("output resized to the exact square requested", /512 × 512/.test(proof10), proof10.match(/\d+ × \d+/g)?.join(" "));
check("output converted to JPG", /JPG/.test(proof10));
check("profile picture reaches a PASS", /Requirement met/.test(proof10), proof10.match(VERDICT)?.[0]);

// ---------------------------------------------------------------------------
// Scenario 11 — split-pdf keeps only the selected pages in a new output PDF
// ---------------------------------------------------------------------------
console.log("\nScenario 11: /split-pdf keeps selected pages");

await page.goto(`${BASE}/split-pdf`, { waitUntil: "networkidle" });
const splitTool = page.getByTestId("tool-workspace");

const sourcePdf = await makeSimplePdf({ pages: 3 });
await splitTool
  .locator('input[type="file"]')
  .setInputFiles({ name: "source.pdf", mimeType: "application/pdf", buffer: sourcePdf });
await splitTool.getByText(/3 pages, in this order/).waitFor({ timeout: 15000 });

await splitTool.getByRole("button", { name: /Remove page 2/i }).click();
check(
  "split flow removes unneeded pages before save",
  await visible(splitTool.getByText(/2 pages, in this order/), 5000),
);

const [splitDownload] = await Promise.all([
  page.waitForEvent("download"),
  (async () => {
    await splitTool.getByRole("button", { name: /Run this plan|Split PDF/i }).click();
    await splitTool.getByText(VERDICT).waitFor({ timeout: 30000 });
    await splitTool.getByRole("link", { name: /Download/i }).click();
  })(),
]);

const splitDoc = await PDFDocument.load(fs.readFileSync(await splitDownload.path()));
check("split output contains only kept pages", splitDoc.getPageCount() === 2, splitDoc.getPageCount());

// ---------------------------------------------------------------------------
// Sitemap should list exactly the live tools, and nothing planned.
// ---------------------------------------------------------------------------
const sitemap = await (await context.request.get(`${BASE}/sitemap.xml`)).text();
check("sitemap includes a live tool", sitemap.includes("/image-under-2mb"));
check(
  "sitemap includes the newly shipped tools",
  [
    "/merge-pdf",
    "/image-to-pdf",
    "/pdf-remove-metadata",
    "/profile-picture-resizer",
    "/split-pdf",
    "/extract-pdf",
    "/delete-pdf-pages",
  ].every((slug) =>
    sitemap.includes(slug),
  ),
);
check("sitemap excludes still-planned tools", !sitemap.includes("/compress-pdf"));

// ---------------------------------------------------------------------------
console.log("");
check("no uncaught page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();

const suffix = skipped > 0 ? ` (${skipped} skipped)` : "";
console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}${suffix}`);
process.exit(failures === 0 ? 0 : 1);
