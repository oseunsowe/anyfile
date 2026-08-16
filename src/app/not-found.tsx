import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Page not found",
  description: "That page does not exist.",
  path: "/404",
  noindex: true,
});

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start py-24 sm:py-32">
      <p className="font-mono text-[0.8125rem] text-ink-subtle">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
        The link may be out of date, or the tool may not have shipped yet. Drop a
        file on the home page and we will work out what it needs.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <ButtonLink href="/" variant="solid">
          Go to the home page
        </ButtonLink>
        <ButtonLink href="/tools" variant="outline">
          Browse all tools
        </ButtonLink>
      </div>
    </Container>
  );
}
