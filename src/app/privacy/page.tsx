import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How AnyFileKits handles your files, cookies, advertising (Google AdSense) and data. Our tools process files in your browser.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-ink-muted">Last updated: 30 September 2026</p>

        <div className="mt-8 space-y-7 break-words text-[0.9375rem] leading-relaxed text-ink-muted">
          <section>
            <h2 className="text-xl font-semibold text-ink">1. Your files stay on your device</h2>
            <p className="mt-2">
              AnyFileKits tools process files in your web browser. When you compress,
              convert, resize, merge or clean a file, it is handled by code running on
              your own device. We do not upload your files to our servers and we do not
              store, view or share them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">2. Information we collect</h2>
            <p className="mt-2">
              We do not require an account and we do not ask for your name or email to use
              the tools. Like most websites, our web server may record standard technical
              information such as IP address, browser type, pages requested and the time of
              the request. We use it to keep the site secure and working. If you email us,
              we keep your message and address to reply to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">3. Cookies and advertising</h2>
            <p className="mt-2">
              We use essential browser storage to remember your cookie choice. If you
              accept optional cookies, third-party vendors, including Google, may use
              cookies to serve ads based on your prior visits to this and other websites.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Google, as a third-party vendor, uses cookies to serve ads on this site.
                Google&apos;s use of advertising cookies enables it and its partners to serve
                ads to you based on your visit to this site and other sites on the internet.
              </li>
              <li>
                You can opt out of personalised advertising by visiting{" "}
                <a
                  className="underline underline-offset-4"
                  href="https://adssettings.google.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Google Ads Settings
                </a>
                . You can also opt out of some third-party vendors&apos; use of cookies for
                personalised advertising at{" "}
                <a
                  className="underline underline-offset-4"
                  href="https://www.aboutads.info"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  aboutads.info
                </a>
                .
              </li>
              <li>
                You can read how Google uses information from sites that use its services at{" "}
                <a
                  className="underline underline-offset-4"
                  href="https://policies.google.com/technologies/partner-sites"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  policies.google.com/technologies/partner-sites
                </a>
                .
              </li>
              <li>
                You can block or delete cookies in your browser settings at any time. If you
                reject optional cookies, we do not load advertising scripts.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">4. Users in the EEA, UK and Switzerland</h2>
            <p className="mt-2">
              We ask for your consent before loading advertising cookies. You can withdraw
              consent by clearing this site&apos;s data in your browser, after which the
              consent banner appears again. You have rights to access, correct and delete
              personal data we hold about you, and to complain to your data protection
              authority. Contact us to exercise them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">5. Children</h2>
            <p className="mt-2">
              AnyFileKits is not directed at children under 13 and we do not knowingly
              collect personal information from them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">6. Security</h2>
            <p className="mt-2">
              The site is served over HTTPS. Because files are processed locally, they are
              not exposed to our servers. No system is perfectly secure, and you should
              always keep backups of important documents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">7. Changes to this policy</h2>
            <p className="mt-2">
              We may update this policy. The date at the top shows when it last changed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">8. Contact</h2>
            <p className="mt-2">
              For privacy questions or requests, email{" "}
              <a className="underline underline-offset-4" href="mailto:privacy@anyfilekits.com">
                privacy@anyfilekits.com
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </section>
  );
}
