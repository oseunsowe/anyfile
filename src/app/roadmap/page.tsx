import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Roadmap",
  description:
    "Feature gap closure plan against leading online document and image tool suites.",
  path: "/roadmap",
});

const groups = [
  {
    title: "Cloud AI",
    items: [
      "Remove background provider now wired behind server key",
      "AI upscaling",
      "Queueing and retries",
      "Temporary object storage with TTL deletion",
    ],
  },
  {
    title: "PDF parity",
    items: [
      "Split, extract, and delete pages",
      "PDF to image conversion",
      "Password protect and unlock",
      "OCR and searchable output",
    ],
  },
  {
    title: "Accounts and billing",
    items: [
      "User auth",
      "Saved workflows and history",
      "Stripe subscriptions",
      "Entitlements and usage limits",
    ],
  },
  {
    title: "Trust and operations",
    items: [
      "Monitoring and alerting",
      "Security hardening and CSP",
      "CI quality gates",
      "Cross-browser and mobile matrix",
    ],
  },
] as const;

export default function RoadmapPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Execution roadmap</h1>
        <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-ink-muted">
          This roadmap tracks the standard capabilities expected in top-tier
          tools like Smallpdf, iLovePDF, Adobe Acrobat Online, TinyWow, and
          modern image AI suites.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <article key={group.title} className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-lg font-semibold text-ink">{group.title}</h2>
              <ul className="mt-3 space-y-2 text-[0.8125rem] text-ink-muted">
                {group.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
