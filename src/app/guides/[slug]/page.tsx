import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { getGuide, guides } from "@/lib/guides";
import { articleJsonLd, pageMetadata } from "@/lib/seo";
import { getTool, type Tool } from "@/lib/tools";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const meta = pageMetadata({
    title: guide.metaTitle,
    description: guide.description,
    path: `/guides/${slug}`,
  });
  return { ...meta, title: { absolute: guide.metaTitle } };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const tools = guide.tools
    .map((toolSlug) => getTool(toolSlug))
    .filter((tool): tool is Tool => tool !== undefined && tool.status === "live");
  const others = guides.filter((g) => g.slug !== slug).slice(0, 3);

  return (
    <article className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <Breadcrumbs
          className="mb-6"
          crumbs={[
            { name: "Home", href: "/" },
            { name: "Guides", href: "/guides" },
            { name: guide.title, href: `/guides/${slug}` },
          ]}
        />
        <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Updated <time dateTime={guide.updated}>{guide.updated}</time> · {guide.readMinutes} min read
        </p>
        <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-muted">{guide.intro}</p>

        {guide.sections.map((section, index) => (
          <section key={section.heading} className="mt-9">
            <h2 className="text-2xl font-semibold text-ink">{section.heading}</h2>
            {section.paragraphs.map((text) => (
              <p key={text.slice(0, 40)} className="mt-3 text-[1rem] leading-relaxed text-ink-muted">
                {text}
              </p>
            ))}
            {section.steps ? (
              <ol className="mt-4 list-decimal space-y-2 pl-6 text-[1rem] leading-relaxed text-ink-muted marker:font-semibold marker:text-ink">
                {section.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : null}
            {index === 0 ? <AdSlot format="leaderboard" className="mt-8" /> : null}
          </section>
        ))}

        {tools.length > 0 ? (
          <aside className="mt-12 rounded-card border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">Try the tools</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {tools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/${tool.slug}`}
                    className="block rounded-control border border-line px-4 py-3 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-surface-muted"
                  >
                    {tool.name}
                    <span className="mt-0.5 block text-[0.8125rem] font-normal text-ink-muted">
                      {tool.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        <nav aria-label="More guides" className="mt-12 border-t border-line pt-8">
          <h2 className="text-lg font-semibold text-ink">More guides</h2>
          <ul className="mt-3 space-y-2">
            {others.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="text-[0.9375rem] text-ink underline underline-offset-4">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <JsonLd
        data={articleJsonLd({
          title: guide.metaTitle,
          description: guide.description,
          path: `/guides/${slug}`,
          datePublished: guide.published,
          dateModified: guide.updated,
        })}
      />
    </article>
  );
}
