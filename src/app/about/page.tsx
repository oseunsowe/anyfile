import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About AnyFileKits",
  description:
    "AnyFileKits helps people get PDFs and images accepted by upload forms, email and marketplaces, using tools that run privately in your browser.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <Breadcrumbs
          className="mb-6"
          crumbs={[
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
          ]}
        />
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">About AnyFileKits</h1>
        <div className="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-ink-muted">
          <p>
            Most people do not want to learn about file formats. They want their resume
            accepted by a job portal, a photo to upload to a form, or a PDF small enough to
            email. AnyFileKits exists to close that gap between the file you have and the
            file a website will accept.
          </p>
          <h2 className="pt-2 text-2xl font-semibold text-ink">What we do</h2>
          <p>
            We build free tools for everyday PDF and image tasks: compressing, converting,
            resizing, merging, cropping and cleaning metadata. Each tool page explains what
            it does, when to use it and how to check the result. Our{" "}
            <Link href="/guides" className="text-ink underline underline-offset-4">
              guides
            </Link>{" "}
            cover the questions people run into most often.
          </p>
          <h2 className="pt-2 text-2xl font-semibold text-ink">Privacy by design</h2>
          <p>
            Our tools run entirely in your browser. When you compress a PDF or convert a
            photo, the work happens on your own device and the file is not uploaded to our
            servers. That is a better fit for resumes, contracts and personal photos than
            tools that require an upload. Read the details in our{" "}
            <Link href="/privacy" className="text-ink underline underline-offset-4">
              privacy policy
            </Link>
            .
          </p>
          <h2 className="pt-2 text-2xl font-semibold text-ink">How we are funded</h2>
          <p>
            AnyFileKits is free to use and supported by advertising. We keep ads clearly
            labelled and away from the upload and download controls.
          </p>
          <h2 className="pt-2 text-2xl font-semibold text-ink">Get in touch</h2>
          <p>
            Found a bug, or want a tool we do not have? Visit our{" "}
            <Link href="/contact" className="text-ink underline underline-offset-4">
              contact page
            </Link>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
