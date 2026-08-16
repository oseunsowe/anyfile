/**
 * Generates `src/components/ui/icon-data.ts` from the Phosphor Iconify set.
 *
 * Why generate instead of importing at runtime: @iconify/react's default
 * behaviour is to fetch icon data from a CDN, which adds a network dependency
 * and a flash of missing icon on first paint. Importing the whole
 * `@iconify-json/ph` package instead bundles ~9,000 icons because a JSON object
 * cannot be tree-shaken. Extracting exactly the icons we use keeps the payload
 * at a few KB with no runtime fetch at all.
 *
 * Add an icon to ICONS below and re-run:  node scripts/build-icons.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** camelCase key → Phosphor icon name. Regular weight for UI controls. */
const ICONS = {
  // Controls and navigation
  upload: "upload-simple",
  menu: "list",
  close: "x",
  caretRight: "caret-right",
  caretUp: "caret-up",
  caretDown: "caret-down",
  plus: "plus",
  arrowRight: "arrow-right",
  download: "download-simple",
  restart: "arrow-counter-clockwise",
  spinner: "circle-notch",
  check: "check",
  question: "question",
  warning: "warning",
  info: "info",
  sparkle: "sparkle",
  clipboard: "clipboard-text",

  // Trust and processing mode
  shieldCheck: "shield-check",
  cloud: "cloud",
  sealCheck: "seal-check",

  // Duotone for large feature tiles — reads richer at 20px+ without adding a
  // second colour, since the accent layer is just currentColor at 20% opacity.
  filePdfDuo: "file-pdf-duotone",
  fileTextDuo: "file-text-duotone",
  imageDuo: "image-duotone",
  magicWandDuo: "magic-wand-duotone",
  lightningDuo: "lightning-duotone",
  scanDuo: "scan-duotone",
  flowArrowDuo: "flow-arrow-duotone",
  sealCheckDuo: "seal-check-duotone",
  shieldCheckDuo: "shield-check-duotone",
  uploadDuo: "upload-simple-duotone",
  cropDuo: "crop-duotone",
  slidersDuo: "sliders-horizontal-duotone",
};

const setPath = require.resolve("@iconify-json/ph/icons.json");
const set = JSON.parse(await readFile(setPath, "utf8"));

/** Iconify sets store some names as aliases pointing at a parent icon. */
function resolve(name) {
  const seen = new Set();
  let current = name;

  while (!seen.has(current)) {
    seen.add(current);
    if (set.icons?.[current]) return set.icons[current];
    const alias = set.aliases?.[current];
    if (!alias) return null;
    current = alias.parent;
  }
  return null;
}

const entries = [];
const missing = [];

for (const [key, name] of Object.entries(ICONS)) {
  const icon = resolve(name);
  if (!icon) {
    missing.push(name);
    continue;
  }
  entries.push([key, { body: icon.body, name }]);
}

if (missing.length > 0) {
  console.error(`Unknown Phosphor icons: ${missing.join(", ")}`);
  process.exit(1);
}

const width = set.width ?? 24;
const height = set.height ?? 24;

const body = entries
  .map(
    ([key, icon]) =>
      `  /** ph:${icon.name} */\n  ${key}: ${JSON.stringify({
        body: icon.body,
        width,
        height,
      })},`,
  )
  .join("\n");

const output = `// GENERATED FILE — do not edit.
// Run \`node scripts/build-icons.mjs\` to regenerate.
// Source: Phosphor Icons (MIT) via @iconify-json/ph.

export type IconData = { body: string; width: number; height: number };

export const iconData = {
${body}
} satisfies Record<string, IconData>;

export type IconName = keyof typeof iconData;
`;

await writeFile("src/components/ui/icon-data.ts", output, "utf8");

const bytes = Buffer.byteLength(output, "utf8");
console.log(`Wrote ${entries.length} icons (${(bytes / 1024).toFixed(1)} KB)`);
