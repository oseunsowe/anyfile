import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How AnyFileKits handles files, metadata, logs, ads, and retention when you use our tools.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-ink-muted">Last updated: 2026-08-17</p>

        <div className="mt-8 space-y-7 text-[0.9375rem] leading-relaxed text-ink-muted">
          <section>
            <h2 className="text-xl font-semibold text-ink">1. What we process</h2>
            <p className="mt-2">
              Most tools process files directly in your browser. When a tool is
              marked as cloud processing, the upload is temporary and only used
              to complete the requested job.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">2. File retention</h2>
            <p className="mt-2">
              Browser-processed files do not leave your device through
              AnyFileKits. Cloud-processed files are deleted automatically after
              processing or after a short retention window needed for delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">3. Metadata and diagnostics</h2>
            <p className="mt-2">
              To run compatibility checks, we may inspect file signatures,
              dimensions, page count, and metadata fields relevant to the task
              such as EXIF GPS tags. We use this only to plan and validate the
              output you asked for.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">4. Cookies and ads</h2>
            <p className="mt-2">
              Essential browser storage is used for app behavior. Optional ad
              cookies are used only if you accept them through our consent
              banner. You can clear or block cookies in your browser settings at
              any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">5. Security</h2>
            <p className="mt-2">
              We apply safeguards such as strict transport security at the
              hosting layer, content-type hardening, and scoped permissions
              policies. No system is perfect, but we continuously review and
              improve controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">6. Contact</h2>
            <p className="mt-2">
              For privacy requests, email: privacy@anyfilekits.com.
            </p>
          </section>
        </div>
      </Container>
    </section>
  );
}
