/**
 * Renders the OG image, PWA icons and apple-touch-icon into public/ using
 * Playwright's Chromium. Run: node scripts/build-brand-images.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><g fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.4 12 3.4 12"/><path d="M10.4 12 19 3.7"/><path d="M10.4 12 19 20.3"/></g></svg>`;

const og = `<body style="margin:0;width:1200px;height:630px;background:linear-gradient(135deg,#eef0ff,#f4f5fa);font-family:Segoe UI,Arial,sans-serif;display:flex;align-items:center;padding:0 90px;box-sizing:border-box">
<div style="width:190px;height:190px;border-radius:44px;background:#4f46e5;padding:38px;box-sizing:border-box;flex:none">${mark}</div>
<div style="margin-left:60px"><div style="font-size:84px;font-weight:700;color:#111827">AnyFileKits</div>
<div style="font-size:40px;color:#4b5563;margin-top:14px;line-height:1.3">Compress, convert &amp; resize PDFs and images.<br>Free, private, in your browser.</div></div></body>`;

const icon = (size, pad) =>
  `<body style="margin:0;width:${size}px;height:${size}px;background:#4f46e5;display:flex;align-items:center;justify-content:center"><div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${mark}</div></body>`;

const browser = await chromium.launch();
await mkdir("public/og", { recursive: true });

async function shot(html, w, h, path) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html);
  await page.screenshot({ path });
  await page.close();
}

await shot(og, 1200, 630, "public/og/default.png");
await shot(icon(180, 36), 180, 180, "public/apple-touch-icon.png");
await shot(icon(192, 38), 192, 192, "public/icon-192.png");
await shot(icon(512, 100), 512, 512, "public/icon-512.png");
await browser.close();
console.log("done");
