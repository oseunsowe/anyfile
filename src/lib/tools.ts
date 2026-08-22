/**
 * Tool registry — the single source of truth for tool families, tool metadata,
 * SEO landing pages, internal linking and sitemap generation (plan.md §3, §8).
 *
 * `status` is deliberate: nothing is marked `live` until its operation actually
 * runs. Planned tools are excluded from the sitemap, which keeps us on the
 * right side of the §8.3 thin-page guardrail.
 */

export type ToolFamily = "pdf" | "image" | "ai" | "smart";

/** §1.3 — must be accurate. Never label a server-processed task on-device. */
export type ProcessingMode = "device" | "cloud";

export type ToolTier = "free" | "pro" | "credits";

export type ToolStatus = "live" | "planned";

export type Tool = {
  /** URL segment, also the SEO landing page path: /{slug} */
  slug: string;
  name: string;
  family: ToolFamily;
  /** One line used on cards and as the meta description seed. */
  summary: string;
  processing: ProcessingMode;
  tier: ToolTier;
  status: ToolStatus;
  /** Part of the §15 MVP scope. */
  mvp: boolean;
  /** Accepted input extensions, lowercase, no dot. */
  accepts: readonly string[];
  /** Slugs of adjacent tools, for the internal-link component (§8.2). */
  related: readonly string[];
};

export type FamilyMeta = {
  id: ToolFamily;
  label: string;
  blurb: string;
  href: string;
  /** Static class strings — Tailwind cannot see dynamically built names. */
  iconClass: string;
  dotClass: string;
};

export const families: readonly FamilyMeta[] = [
  {
    id: "pdf",
    label: "PDF & Documents",
    blurb: "Convert, merge, split, compress, OCR, protect and more.",
    href: "/tools#pdf",
    iconClass: "bg-cat-pdf-soft text-cat-pdf",
    dotClass: "bg-cat-pdf",
  },
  {
    id: "image",
    label: "Images",
    blurb: "Compress, resize, convert, crop and clean up photos.",
    href: "/tools#image",
    iconClass: "bg-cat-image-soft text-cat-image",
    dotClass: "bg-cat-image",
  },
  {
    id: "ai",
    label: "AI Studio",
    blurb: "Remove backgrounds, enhance images, OCR and more.",
    href: "/tools#ai",
    iconClass: "bg-cat-ai-soft text-cat-ai",
    dotClass: "bg-cat-ai",
  },
  {
    id: "smart",
    label: "Smart Tools",
    blurb: "Ready-made workflows for everyday tasks.",
    href: "/tools#smart",
    iconClass: "bg-cat-smart-soft text-cat-smart",
    dotClass: "bg-cat-smart",
  },
] as const;

export const tools: readonly Tool[] = [
  // ---- Images (§15 MVP 1—6) --------------------------------------------
  {
    slug: "heic-to-jpg",
    name: "HEIC to JPG",
    family: "image",
    summary: "Turn iPhone HEIC photos into JPGs that open anywhere.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["heic", "heif"],
    related: ["compress-image", "resize-image", "jpg-to-png"],
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG",
    family: "image",
    summary: "Convert JPG photos to lossless PNG in your browser.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg"],
    related: ["png-to-jpg", "compress-image", "heic-to-jpg"],
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG",
    family: "image",
    summary: "Convert PNG images to smaller, widely compatible JPGs.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["png"],
    related: ["jpg-to-png", "compress-image", "webp-converter"],
  },
  {
    slug: "webp-converter",
    name: "WebP converter",
    family: "image",
    summary: "Convert to and from WebP for faster web images.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["webp", "jpg", "jpeg", "png"],
    related: ["compress-image", "jpg-to-png", "resize-image"],
  },
  {
    slug: "compress-image",
    name: "Compress image",
    family: "image",
    summary: "Shrink photos with a live quality preview before you download.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "webp"],
    related: ["image-under-1mb", "resize-image", "reduce-photo-size-for-email"],
  },
  {
    slug: "image-under-1mb",
    name: "Image under 1 MB",
    family: "image",
    summary: "Compress a photo to a hard 1 MB ceiling and prove it passed.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "webp", "heic"],
    related: ["image-under-2mb", "compress-image", "reduce-photo-size-for-email"],
  },
  {
    slug: "image-under-2mb",
    name: "Image under 2 MB",
    family: "image",
    summary: "Hit a 2 MB upload limit exactly, without guessing at quality.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "webp", "heic"],
    related: ["image-under-1mb", "compress-image", "compress-pdf-under-2mb"],
  },
  {
    slug: "resize-image",
    name: "Resize image",
    family: "image",
    summary: "Resize by pixels, percentage or a destination preset.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "webp", "heic"],
    related: ["profile-picture-resizer", "compress-image", "crop-image"],
  },
  {
    slug: "profile-picture-resizer",
    name: "Profile Picture Resizer",
    family: "image",
    summary: "Pick a platform — LinkedIn, Instagram, X, WhatsApp and more — and resize to fit.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "webp", "heic"],
    related: ["resize-image", "compress-image", "remove-location-from-photo"],
  },
  {
    slug: "crop-image",
    name: "Crop & rotate",
    family: "image",
    summary: "Crop, straighten and rotate images without quality loss.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "webp"],
    related: ["resize-image", "compress-image", "watermark-image"],
  },
  {
    slug: "watermark-image",
    name: "Add watermark",
    family: "image",
    summary: "Stamp repeating text across a photo before sharing it.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "webp"],
    related: ["crop-image", "resize-image", "compress-image"],
  },
  {
    slug: "remove-location-from-photo",
    name: "Remove photo location",
    family: "image",
    summary: "Strip GPS and EXIF data before you share a photo.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "heic", "tiff"],
    related: ["compress-image", "resize-image", "pdf-remove-metadata"],
  },
  {
    slug: "reduce-photo-size-for-email",
    name: "Resize photo for email",
    family: "image",
    summary: "Get photos under a mail provider's attachment limit in one step.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "heic", "webp"],
    related: ["image-under-2mb", "compress-image", "compress-pdf"],
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    family: "image",
    summary: "Combine photos and scans into a single ordered PDF.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "webp", "heic"],
    related: ["pdf-to-jpg", "merge-pdf", "compress-pdf"],
  },

  // ---- PDF (§15 MVP 7—12) ----------------------------------------------
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    family: "pdf",
    summary: "Drag pages into order and combine files into one PDF.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf"],
    related: ["split-pdf", "organize-pdf", "compress-pdf"],
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    family: "pdf",
    summary: "Split out selected pages into a new PDF file.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf"],
    related: ["extract-pdf", "delete-pdf-pages", "organize-pdf"],
  },
  {
    slug: "extract-pdf",
    name: "Extract PDF pages",
    family: "pdf",
    summary: "Keep only the pages you want and save them as a new PDF.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf"],
    related: ["split-pdf", "delete-pdf-pages", "organize-pdf"],
  },
  {
    slug: "delete-pdf-pages",
    name: "Delete PDF pages",
    family: "pdf",
    summary: "Remove unwanted pages from a PDF and keep the rest.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf"],
    related: ["organize-pdf", "split-pdf", "extract-pdf"],
  },
  {
    slug: "organize-pdf",
    name: "Organize PDF",
    family: "pdf",
    summary: "Reorder, rotate and delete pages in a numbered list.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf"],
    related: ["merge-pdf", "rotate-pdf", "compress-pdf"],
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    family: "pdf",
    summary: "Turn every page of a PDF the right way up in one step.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf"],
    related: ["organize-pdf", "merge-pdf", "compress-pdf"],
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    family: "pdf",
    summary: "Reduce PDF file size while keeping it readable.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf"],
    related: ["compress-pdf-under-2mb", "merge-pdf", "pdf-to-jpg"],
  },
  {
    slug: "compress-pdf-under-2mb",
    name: "Compress PDF under 2 MB",
    family: "pdf",
    summary: "Meet a 2 MB upload limit and see the result validated against it.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf"],
    related: ["compress-pdf", "image-under-2mb", "reduce-photo-size-for-email"],
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    family: "pdf",
    summary: "Export every PDF page as an image, or just the pages you pick.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf"],
    related: ["image-to-pdf", "split-pdf", "compress-image"],
  },
  {
    slug: "pdf-remove-metadata",
    name: "Remove PDF metadata",
    family: "pdf",
    summary: "Clear author, software and revision data from a PDF.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf"],
    related: ["remove-location-from-photo", "compress-pdf", "organize-pdf"],
  },

  // ---- AI (§15 MVP 13, cloud-processed) ---------------------------------
  {
    slug: "remove-background",
    name: "Remove background",
    family: "ai",
    summary: "Cut out a subject and export on a transparent background.",
    processing: "cloud",
    tier: "credits",
    status: "live",
    mvp: true,
    accepts: ["jpg", "jpeg", "png", "webp"],
    related: ["resize-image", "compress-image", "smartfix"],
  },

  // ---- SmartFix + Recipes (§15 MVP 14—15) -------------------------------
  {
    slug: "smartfix",
    name: "SmartFix",
    family: "smart",
    summary: "Describe the outcome you need and we chain the right steps.",
    processing: "device",
    tier: "free",
    status: "live",
    mvp: true,
    accepts: ["pdf", "jpg", "jpeg", "png", "webp", "heic"],
    related: ["compress-pdf", "remove-background", "resize-image"],
  },
] as const;

const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));

export function getTool(slug: string): Tool | undefined {
  return bySlug.get(slug);
}

export function getToolsByFamily(family: ToolFamily): Tool[] {
  return tools.filter((tool) => tool.family === family);
}

/** Deployment-safe family listing: only tools that are actually runnable now. */
export function getLiveToolsByFamily(family: ToolFamily): Tool[] {
  return tools.filter((tool) => tool.family === family && tool.status === "live");
}

/** Only live tools get indexed — see the §8.3 guardrail note at the top. */
export function getIndexableTools(): Tool[] {
  return tools.filter((tool) => tool.status === "live");
}

export function getRelatedTools(slug: string): Tool[] {
  const tool = getTool(slug);
  if (!tool) return [];
  return tool.related
    .map((relatedSlug) => bySlug.get(relatedSlug))
    .filter((related): related is Tool => related !== undefined && related.status === "live");
}

export function getFamily(id: ToolFamily): FamilyMeta {
  const family = families.find((candidate) => candidate.id === id);
  if (!family) throw new Error(`Unknown tool family: ${id}`);
  return family;
}
