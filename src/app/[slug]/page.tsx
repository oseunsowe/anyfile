import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { AdSlot } from "@/components/ads/AdSlot";
import { Container } from "@/components/ui/Container";
import { PrivacyBadge } from "@/components/ui/Badge";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { pageMetadata, toolJsonLd } from "@/lib/seo";
import { getIndexableTools, getTool } from "@/lib/tools";
import { getToolContent } from "@/lib/toolContent";

/**
 * SEO tool landing page template (todo.md P0 "SEO Foundation").
 *
 * Only tools that are both `live` in the registry and have hand-written content
 * get a route. That pairing is the §8.3 guardrail in code: a page cannot exist
 * without a working interactive experience *and* unique explanatory value.
 */

export function generateStaticParams() {
  return getIndexableTools()
    .filter((tool) => getToolContent(tool.slug))
    .map((tool) => ({ slug: tool.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const content = getToolContent(slug);
  if (!content) return {};

  return pageMetadata({
    title: content.metaTitle,
    description: content.metaDescription,
    path: `/${slug}`,
  });
}

export default async function ToolPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const tool = getTool(slug);
  const content = getToolContent(slug);

  if (!tool || !content || tool.status !== "live") notFound();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container className="py-10 sm:py-14">
          <Breadcrumbs
            className="mb-6"
            crumbs={[
              { name: "Home", href: "/" },
              { name: "All tools", href: "/tools" },
              { name: tool.name, href: `/${slug}` },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14">
            <div className="max-w-xl">
              <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                {content.h1}
              </h1>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-muted">
                {content.intro}
              </p>
              <PrivacyBadge mode={tool.processing} className="mt-6" />
            </div>

            <ToolWorkspace
              preset={content.preset}
              accept={content.accept}
              runLabel={tool.name}
            />
          </div>
        </Container>
      </section>

      {/* §7: one ad below the tool input, never between upload and processing. */}
      <div className="border-b border-line py-8">
        <AdSlot format="leaderboard" />
      </div>

      <FaqSection entries={content.faqs} />

      <RelatedTools
        slug={slug}
        title="Related tools"
        description="Other things people do with the same file."
      />

      <JsonLd
        data={toolJsonLd({
          name: tool.name,
          description: content.metaDescription,
          path: `/${slug}`,
          free: tool.tier === "free",
        })}
      />
    </>
  );
}
