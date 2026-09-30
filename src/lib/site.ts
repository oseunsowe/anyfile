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
  { label: "PDF", href: "/tools#pdf" },
  { label: "Images", href: "/tools#image" },
  { label: "Guides", href: "/guides" },
  { label: "About", href: "/about" },
] as const;

/** Same rule as above: every href here must resolve. */
export const footerNav: readonly { title: string; items: readonly NavItem[] }[] = [
  {
    title: "Tools",
    items: [
      { label: "All tools", href: "/tools" },
      { label: "PDF tools", href: "/tools#pdf" },
      { label: "Image tools", href: "/tools#image" },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Guides", href: "/guides" },
      { label: "Compress a PDF", href: "/guides/how-to-compress-a-pdf-under-2mb" },
      { label: "Open HEIC files", href: "/guides/how-to-open-heic-files-on-windows" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
] as const;
