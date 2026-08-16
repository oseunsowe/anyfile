import { Container, SectionHeading } from "@/components/ui/Container";
import { ToolCard } from "@/components/tools/ToolCard";
import { getRelatedTools } from "@/lib/tools";
import { cn } from "@/lib/cn";

/**
 * Internal linking by task adjacency (§8.2). Sourced from the tool registry so
 * the link graph stays consistent as tools are added or renamed.
 */
export function RelatedTools({
  slug,
  title = "Related tools",
  description,
  className,
}: {
  slug: string;
  title?: string;
  description?: string;
  className?: string;
}) {
  const related = getRelatedTools(slug);
  if (related.length === 0) return null;

  return (
    <section className={cn("border-t border-line bg-surface-muted py-14 sm:py-20", className)}>
      <Container>
        <SectionHeading title={title} description={description} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </Container>
    </section>
  );
}
