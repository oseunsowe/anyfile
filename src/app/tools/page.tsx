import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ToolCard } from "@/components/tools/ToolCard";
import { pageMetadata } from "@/lib/seo";
import { families, getLiveToolsByFamily } from "@/lib/tools";

export const metadata: Metadata = pageMetadata({
  title: "All tools",
  description:
    "Every AnyFileKits tool for PDFs, images and documents — grouped by what you are trying to do.",
  path: "/tools",
});

/**
 * Tools directory (reference screen 1.3). Grouped by family rather than listed
 * flat: §4.1 warns against reading as a "free tools directory", so the grouping
 * carries the intent even on the browse-first path.
 */
export default function ToolsPage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container className="py-10 sm:py-14">
          <Breadcrumbs
            className="mb-5"
            crumbs={[
              { name: "Home", href: "/" },
              { name: "All tools", href: "/tools" },
            ]}
          />
          <SectionHeading
            title="All tools"
            description="Know exactly what you need? Pick a tool. Not sure? Drop your file on the home page and we will work it out."
          />
        </Container>
      </section>

      {families.map((family) => {
        const familyTools = getLiveToolsByFamily(family.id);
        if (familyTools.length === 0) return null;

        return (
          <section
            key={family.id}
            id={family.id}
            className="scroll-mt-20 border-b border-line py-12 last:border-b-0 sm:py-16"
          >
            <Container>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-full ${family.dotClass}`}
                />
                <h2 className="text-xl font-semibold text-ink">{family.label}</h2>
              </div>
              <p className="mt-1.5 text-[0.9375rem] text-ink-muted">{family.blurb}</p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {familyTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </Container>
          </section>
        );
      })}
    </>
  );
}
