import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SmartFixConsole } from "@/components/home/SmartFixConsole";
import { site } from "@/lib/site";

const PILLARS: { icon: IconName; term: string; detail: string }[] = [
  {
    icon: "scanDuo",
    term: "It reads the file first",
    detail: "Format, size, dimensions and hidden location data — from the bytes, not the name.",
  },
  {
    icon: "slidersDuo",
    term: "It plans the whole chain",
    detail: "Convert, resize, clean and compress in the right order, with a reason for each step.",
  },
  {
    icon: "sealCheckDuo",
    term: "It proves the result",
    detail: "Your requirement is checked against the output, so you are not left hoping.",
  },
  {
    icon: "shieldCheckDuo",
    term: "It runs on your device",
    detail: "Everyday operations never leave the browser. Cloud steps are always labelled.",
  },
];

/**
 * Outcome-first hero (plan.md §4.2).
 *
 * The console sits in the hero rather than a decorative illustration: §1.2
 * requires the first successful result to come before any sign-up, so the
 * highest-value thing above the fold is the working product. The file-flow
 * graphic lives in `FlowBand` below, where it can explain rather than ornament.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Decorative wash. Two offset radials read as depth without a texture. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(60rem_24rem_at_15%_-10%,var(--afk-brand-soft),transparent),radial-gradient(40rem_20rem_at_85%_0%,var(--afk-cat-image-soft),transparent)] opacity-70"
      />

      <Container className="relative py-14 sm:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
          <Stagger className="max-w-xl" step={0.08}>
            <StaggerItem>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.75rem] font-medium text-brand-ink shadow-sm">
                <Icon name="sparkle" className="size-3.5 text-brand" />
                Tell us the result. We handle the tools.
              </p>
            </StaggerItem>

            <StaggerItem>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl">
                Anything in.
                <br />
                Ready for anywhere.
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-muted">
                Upload a document or image, tell us where it&rsquo;s going, and{" "}
                {site.name} works out the format, size, dimensions and
                optimization for you.
              </p>
            </StaggerItem>

            <StaggerItem>
              <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {PILLARS.map((pillar) => (
                  <div key={pillar.term} className="flex gap-3">
                    <Icon name={pillar.icon} className="mt-0.5 size-5 text-brand" />
                    <div>
                      <dt className="text-[0.875rem] font-semibold text-ink">{pillar.term}</dt>
                      <dd className="mt-1 text-[0.8125rem] leading-relaxed text-ink-muted">
                        {pillar.detail}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </StaggerItem>
          </Stagger>

          <SmartFixConsole />
        </div>
      </Container>
    </section>
  );
}
