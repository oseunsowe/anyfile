import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, type FaqEntry } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

/**
 * Intent-specific FAQ (§8.2). Uses native <details> so it is keyboard operable
 * and readable with JavaScript disabled — the answers are indexable content,
 * not progressive enhancement.
 *
 * `emitStructuredData` defaults to false: FAQ rich results have narrow
 * eligibility, so a page opts in only when it genuinely qualifies.
 */
export function FaqSection({
  entries,
  title = "Frequently asked questions",
  emitStructuredData = false,
  className,
}: {
  entries: readonly FaqEntry[];
  title?: string;
  emitStructuredData?: boolean;
  className?: string;
}) {
  if (entries.length === 0) return null;

  return (
    <section className={cn("py-14 sm:py-20", className)}>
      <Container>
        <h2 className="text-2xl font-semibold text-ink sm:text-[1.75rem]">
          {title}
        </h2>
        <dl className="mt-7 divide-y divide-line border-y border-line">
          {entries.map((entry) => (
            <div key={entry.question}>
              <details className="group">
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center justify-between gap-4 py-4",
                    "text-[0.9375rem] font-medium text-ink marker:hidden",
                  )}
                >
                  <dt>{entry.question}</dt>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-xl leading-none text-ink-subtle transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <dd className="pb-5 pr-8 text-[0.9375rem] leading-relaxed text-ink-muted">
                  {entry.answer}
                </dd>
              </details>
            </div>
          ))}
        </dl>
      </Container>
      {emitStructuredData ? <JsonLd data={faqJsonLd(entries)} /> : null}
    </section>
  );
}
