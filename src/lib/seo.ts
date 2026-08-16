import type { Metadata } from "next";
import { site } from "@/lib/site";

/** Absolute URL for canonicals, OG images and structured data. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

type PageMetaInput = {
  title: string;
  description: string;
  /** Site-root-relative path, e.g. "/compress-pdf". */
  path: string;
  /** Task results, uploads and account pages must never be indexed (§8.2). */
  noindex?: boolean;
  ogImage?: string;
};

/**
 * Builds page metadata with a canonical URL every time. plan.md §8.2 requires a
 * canonical on every indexable page, so this helper is the only sanctioned way
 * to declare page metadata.
 */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  ogImage = "/og/default.png",
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.locale,
      title,
      description,
      url,
      images: [{ url: absoluteUrl(ogImage), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      site: site.twitter,
      title,
      description,
      images: [absoluteUrl(ogImage)],
    },
  };
}

export type Crumb = { name: string; href: string };

/** BreadcrumbList structured data (§8.2). */
export function breadcrumbJsonLd(crumbs: readonly Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.href),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: absoluteUrl("/brand/anyfilekits-mark.svg"),
    description: site.description,
  };
}

/**
 * WebApplication markup for tool pages.
 *
 * Deliberately omits aggregateRating — plan.md §8.2 allows structured data only
 * where it is truthful and eligible, and we have no review corpus.
 */
export function toolJsonLd(input: {
  name: string;
  description: string;
  path: string;
  free: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    ...(input.free
      ? { offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }
      : {}),
  };
}

export type FaqEntry = { question: string; answer: string };

export function faqJsonLd(entries: readonly FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}
