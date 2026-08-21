import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "Terms governing access to AnyFileKits tools, acceptable usage, and service disclaimers.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Terms of Use</h1>
        <p className="mt-3 text-sm text-ink-muted">Last updated: 2026-08-17</p>

        <div className="mt-8 space-y-7 text-[0.9375rem] leading-relaxed text-ink-muted">
          <section>
            <h2 className="text-xl font-semibold text-ink">1. Service scope</h2>
            <p className="mt-2">
              AnyFileKits provides file processing tools on a best-effort basis.
              Features may change as we improve quality, compatibility, and
              security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">2. Acceptable use</h2>
            <p className="mt-2">
              You may not use the service for unlawful content, rights
              violations, abuse, or attempts to degrade service availability for
              other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">3. Your files and rights</h2>
            <p className="mt-2">
              You are responsible for the files you upload and for confirming you
              have rights to process them. We do not claim ownership of your
              files.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">4. Disclaimer</h2>
            <p className="mt-2">
              Tools are provided &quot;as is&quot; without warranties of uninterrupted
              availability or fitness for a specific purpose. Always verify final
              outputs before submitting critical documents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">5. Limitation of liability</h2>
            <p className="mt-2">
              To the fullest extent allowed by law, AnyFileKits is not liable for
              indirect, incidental, or consequential damages arising from your
              use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">6. Contact</h2>
            <p className="mt-2">Questions about these terms: legal@anyfilekits.com.</p>
          </section>
        </div>
      </Container>
    </section>
  );
}
