import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import { cn } from "@/lib/cn";

/** Visible breadcrumbs plus matching BreadcrumbList markup (§8.2). */
export function Breadcrumbs({
  crumbs,
  className,
}: {
  crumbs: readonly Crumb[];
  className?: string;
}) {
  if (crumbs.length === 0) return null;

  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("text-[0.8125rem]", className)}>
        <ol className="flex flex-wrap items-center gap-1 text-ink-muted">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1">
                {isLast ? (
                  <span aria-current="page" className="font-medium text-ink">
                    {crumb.name}
                  </span>
                ) : (
                  <>
                    <Link href={crumb.href} className="rounded hover:text-ink">
                      {crumb.name}
                    </Link>
                    <Icon name="caretRight" className="size-3.5 text-ink-subtle" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
