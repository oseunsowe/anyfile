/**
 * Single source of truth for brand copy, navigation and public URLs.
 * Referenced by metadata, structured data, sitemap and the site shell.
 */

export const site = {
  name: "AnyFileKits",
  /** plan.md §4.2 hero promise, as rendered in the asset/ reference. */
  tagline: "Anything in. Ready for anywhere.",
  description:
    "Convert, compress, edit, OCR and optimize PDFs, documents, images and more — in just a few clicks.",
  /** Override per environment; used for canonicals, OG and sitemap. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://anyfilekits.com",
  locale: "en_US",
  twitter: "@anyfilekits",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

/**
 * Header navigation.
 *
 * The reference (screen 1.1) also shows Solutions, Pricing and Resources. They
 * are deliberately absent until those routes exist — shipping nav items that
 * 404 costs more in trust than the missing links do in completeness. Add each
 * one back in the same commit that adds its page.
 */
export const primaryNav: readonly NavItem[] = [
  { label: "Tools", href: "/tools" },
  { label: "Plans", href: "/plans" },
  { label: "Demo", href: "/demo" },
  { label: "AI Studio", href: "/tools#ai" },
  { label: "Workflows", href: "/tools#smart" },
] as const;

/** Same rule as above: every href here must resolve. */
export const footerNav: readonly { title: string; items: readonly NavItem[] }[] = [
  {
    title: "PDF",
    items: [{ label: "All PDF tools", href: "/tools#pdf" }],
  },
  {
    title: "Images",
    items: [{ label: "All image tools", href: "/tools#image" }],
  },
  {
    title: "AI",
    items: [{ label: "AI Studio", href: "/tools#ai" }],
  },
  {
    title: "Product",
    items: [
      { label: "All tools", href: "/tools" },
      { label: "Plans", href: "/plans" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Demo login", href: "/login" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;

/**
 * Homepage proof band (reference 1.1).
 *
 * TODO(pre-launch): every figure here must be replaced with a measured value or
 * removed. plan.md §17 ties launch to real numbers, and shipping invented
 * counts as social proof is a claim we cannot support.
 */
export const proofStats: readonly { value: string; label: string; verified: boolean }[] = [
  { value: "25+", label: "Powerful tools", verified: false },
  { value: "1M+", label: "Files processed", verified: false },
  { value: "99%", label: "Satisfaction", verified: false },
  { value: "100%", label: "Private & secure", verified: false },
] as const;
