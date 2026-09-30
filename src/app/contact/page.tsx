import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact AnyFileKits",
  description:
    "Contact the AnyFileKits team for support, feedback, tool requests, privacy questions or advertising enquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <Breadcrumbs
          className="mb-6"
          crumbs={[
            { name: "Home", href: "/" },
            { name: "Contact", href: "/contact" },
          ]}
        />
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Contact us</h1>
        <div className="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-ink-muted">
          <p>We read every message and aim to reply within two business days.</p>
          <ul className="space-y-3">
            <li>
              <strong className="text-ink">Support and feedback:</strong>{" "}
              <a className="underline underline-offset-4" href="mailto:contact@anyfilekits.com">
                contact@anyfilekits.com
              </a>
            </li>
            <li>
              <strong className="text-ink">Privacy requests:</strong>{" "}
              <a className="underline underline-offset-4" href="mailto:privacy@anyfilekits.com">
                privacy@anyfilekits.com
              </a>
            </li>
          </ul>
          <p>
            When reporting a problem, tell us which tool you were using, your browser and
            device, and what happened. Please do not email sensitive files. Our tools work
            on your device, so we usually do not need your file to reproduce an issue.
          </p>
        </div>
      </Container>
    </section>
  );
}
