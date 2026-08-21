import Link from "next/link";
import { Card, IconTile } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { getFamily, type Tool, type ToolFamily } from "@/lib/tools";

/** Duotone weight: these render at 18px+ inside a tinted tile. */
const familyIcons: Record<ToolFamily, IconName> = {
  pdf: "filePdfDuo",
  image: "imageDuo",
  ai: "magicWandDuo",
  smart: "lightningDuo",
};

export function FamilyIcon({
  family,
  className,
}: {
  family: ToolFamily;
  className?: string;
}) {
  return <Icon name={familyIcons[family]} className={cn("size-[1.125rem]", className)} />;
}

/**
 * Tool tile used in the directory, related-tool rails and the homepage.
 *
 * A tool that is not `live` yet renders as a non-interactive card. Linking to a
 * route that does not exist would create dead ends for crawlers and users.
 */
export function ToolCard({ tool, className }: { tool: Tool; className?: string }) {
  const family = getFamily(tool.family);
  const isLive = tool.status === "live";

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <IconTile className={family.iconClass}>
          <FamilyIcon family={tool.family} />
        </IconTile>
        {!isLive ? <Badge tone="neutral">Planned</Badge> : null}
      </div>
      <h3 className="mt-4 text-[0.9375rem] font-semibold text-ink">{tool.name}</h3>
      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">
        {tool.summary}
      </p>
    </>
  );

  const shell = cn("p-5", !isLive && "opacity-70", className);

  if (!isLive) {
    return <Card className={shell}>{body}</Card>;
  }

  return (
    <Card as="article" interactive className={cn(shell, "relative")}>
      {body}
      {/* Whole-card target while keeping a single, descriptive tab stop. */}
      <Link
        href={`/${tool.slug}`}
        className="absolute inset-0 rounded-card"
        aria-label={`${tool.name} — ${tool.summary}`}
      >
        <span className="sr-only">{tool.name}</span>
      </Link>
    </Card>
  );
}
