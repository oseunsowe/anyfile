import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { FlowBand } from "@/components/home/FlowBand";
import {
  FamilyRail,
  HowItWorks,
  PromiseBand,
  WorkflowRail,
} from "@/components/home/sections";
import { FaqSection } from "@/components/seo/FaqSection";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/Container";
import { guides } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Free PDF & Image Tools – Compress, Convert, Resize",
    description:
      "Compress PDFs, convert HEIC to JPG, resize images, merge PDFs and remove photo metadata. Free online tools that run in your browser, so your files stay private.",
    path: "/",
  }),
  title: { absolute: "Free PDF & Image Tools – Compress, Convert | AnyFileKits" },
};

const faqs = [
  {
    question: "Do my files get uploaded to a server?",
    answer:
      "No. Diagnosis and everyday operations such as conversion, resizing, compression, metadata removal and PDF rearrangement run entirely in your browser. The file never leaves your device.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. There is nothing to sign up for. Drop a file, see what we found and get a result straight away.",
  },
  {
    question: "What does “tell us the result” actually mean?",
    answer:
      "Instead of picking a tool, you describe the outcome — for example “make this under 2 MB for a job application”. We read the file, work out which operations are needed and in what order, then show you that plan before anything runs.",
  },
  {
    question: "How do I know the file will actually be accepted?",
    answer:
      "You can state the requirement explicitly, such as PDF at most 2 MB. We check the finished file against every part of that requirement and show a pass or fail per item. If something could not be measured, we say so rather than claiming a pass.",
  },
  {
    question: "Which formats are supported?",
    answer:
      "The first release focuses on PDF and common image formats including JPG, PNG, WebP and HEIC from iPhone. More document formats follow once they meet our quality bar.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <PromiseBand />
      <FlowBand />
      <HowItWorks />
      <FamilyRail />
      <WorkflowRail />
      <section className="border-t border-line py-14 sm:py-20">
        <Container>
          <SectionHeading
            title="Helpful guides"
            description="Step-by-step answers for the most common PDF and image problems."
          />
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guides.slice(0, 6).map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="block h-full rounded-card border border-line bg-surface p-4 text-[0.9375rem] font-medium text-ink transition-colors hover:border-ink-subtle"
                >
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5">
            <Link href="/guides" className="text-[0.9375rem] font-medium text-ink underline underline-offset-4">
              See all guides
            </Link>
          </p>
        </Container>
      </section>
      <FaqSection entries={faqs} emitStructuredData className="border-t border-line bg-surface-muted" />
    </>
  );
}
