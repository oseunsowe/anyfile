import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AdProvider } from "@/components/ads/AdProvider";
import { ConsentBanner } from "@/components/ads/ConsentBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { readDemoSession } from "@/lib/auth/demoSession";
import { EntitlementsProvider, type Entitlements } from "@/lib/entitlements";
import { organizationJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    // Every page supplies its own unique title (§8.2).
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await readDemoSession();
  const entitlements: Entitlements = {
    loggedIn: session !== null,
    email: session?.sub ?? null,
    plan: session?.plan ?? "free",
  };

  return (
    <html
      lang="en-US"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <a href="#main" className="skip-link rounded-control bg-solid px-4 py-2 text-sm font-medium text-ink-inverse">
          Skip to content
        </a>
        <EntitlementsProvider value={entitlements}>
          <AdProvider />
          <SiteHeader entitlements={entitlements} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <ConsentBanner />
        </EntitlementsProvider>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
