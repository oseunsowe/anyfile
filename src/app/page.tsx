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
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  path: "/",
});

const faqs = [
  {
    question: "Do my files get uploaded to a server?",
    answer:
      "Diagnosis and everyday operations such as conversion, resizing, metadata removal and PDF rearrangement run entirely in your browser — the file never leaves your device. A small number of AI operations need cloud processing, and those are labelled as such everywhere they appear.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. You can drop a file, see what we found and get a result without signing up. An account only becomes useful when you want to save a Recipe, run larger batches or keep presets in sync.",
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
      <FaqSection entries={faqs} className="border-t border-line bg-surface-muted" />
    </>
  );
}
