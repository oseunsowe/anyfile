import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container, SectionHeading } from "@/components/ui/Container";
import { guides } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "File Guides: PDF, Image and Photo How-Tos",
  description:
    "Plain-English guides for compressing PDFs, converting HEIC photos, resizing images, removing metadata and getting files accepted by upload forms.",
  path: "/guides",
});

export default function GuidesIndexPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs
          className="mb-5"
          crumbs={[
            { name: "Home", href: "/" },
            { name: "Guides", href: "/guides" },
          ]}
        />
        <SectionHeading
          as="h1"
          title="File guides"
          description="Practical answers for the file problems that block you: size limits, wrong formats and privacy."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="flex flex-col rounded-card border border-line bg-surface p-5 transition-colors hover:border-ink-subtle"
            >
              <h2 className="text-lg font-semibold leading-snug text-ink">{guide.title}</h2>
              <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">
                {guide.description}
              </p>
              <p className="mt-4 text-[0.8125rem] text-ink-subtle">
                {guide.readMinutes} min read
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
