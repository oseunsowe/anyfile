import Link from "next/link";
import { Card, IconTile } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { FamilyIcon } from "@/components/tools/ToolCard";
import { families } from "@/lib/tools";
import { describeRequirement } from "@/lib/requirement";
import { workflows } from "@/lib/workflows";

/**
 * Product promises. Every line here is a property of the build we can point at
 * in code — no usage counts or satisfaction figures, which we have not measured
 * and must not invent (plan.md §17).
 */
export function PromiseBand() {
  const promises: { icon: IconName; label: string; detail: string }[] = [
    { icon: "shieldCheckDuo", label: "Runs in your browser", detail: "For everyday operations" },
    { icon: "sealCheckDuo", label: "No sign-up to start", detail: "Result first, account later" },
    { icon: "scanDuo", label: "Reads the real bytes", detail: "Not just the file extension" },
    { icon: "cloud", label: "Cloud steps labelled", detail: "You always know where it ran" },
  ];

  return (
    <section className="border-b border-line bg-surface">
      <Stagger as="div" className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {promises.map((promise) => (
          <StaggerItem key={promise.label} className="flex items-start gap-3">
            <IconTile size="sm" className="bg-brand-soft text-brand">
              <Icon name={promise.icon} className="size-[1.125rem]" />
            </IconTile>
            <div>
              <p className="text-[0.875rem] font-semibold text-ink">{promise.label}</p>
              <p className="text-[0.8125rem] text-ink-muted">{promise.detail}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/** §4.2 "How it works" — the outcome-first loop in four beats. */
export function HowItWorks() {
  const steps: { icon: IconName; title: string; detail: string }[] = [
    {
      icon: "uploadDuo",
      title: "Drop the file",
      detail: "Drag, browse or paste. We read it on your device.",
    },
    {
      icon: "scanDuo",
      title: "We diagnose it",
      detail: "Size, format, dimensions and hidden metadata, from the bytes.",
    },
    {
      icon: "flowArrowDuo",
      title: "We plan the steps",
      detail: "The full chain, in the right order, with a reason for each.",
    },
    {
      icon: "sealCheckDuo",
      title: "We prove the result",
      detail: "Your requirement checked against the output before you download.",
    },
  ];

  return (
    <section className="py-14 sm:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            title="How it works"
            description="You describe the outcome. We work out the operations."
          />
        </Reveal>

        <Stagger as="ol" className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <StaggerItem as="li" key={step.title}>
              <Card className="h-full p-5">
                <div className="flex items-center justify-between">
                  <IconTile className="bg-brand-soft text-brand">
                    <Icon name={step.icon} className="size-5" />
                  </IconTile>
                  <span aria-hidden="true" className="font-mono text-[0.75rem] text-ink-subtle">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-[0.9375rem] font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                  {step.detail}
                </p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/** Tool families — the SEO-visitor path for people who know the tool they want. */
export function FamilyRail() {
  return (
    <section className="border-y border-line bg-surface-muted py-14 sm:py-20">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            title="All the tools you need"
            description="Already know the tool? Go straight to it."
          />
          <Link
            href="/tools"
            className="group inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-brand hover:underline"
          >
            View all tools
            <Icon
              name="arrowRight"
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>

        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {families.map((family) => (
            <StaggerItem key={family.id}>
              <Card interactive className="relative h-full p-5">
                <IconTile className={family.iconClass}>
                  <FamilyIcon family={family.id} className="size-5" />
                </IconTile>
                <h3 className="mt-4 text-[0.9375rem] font-semibold text-ink">{family.label}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                  {family.blurb}
                </p>
                <Link href={family.href} className="absolute inset-0 rounded-card">
                  <span className="sr-only">{family.label}</span>
                </Link>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/**
 * Destination Workflows. Platform workflows without a verified, dated
 * requirement are shown as unavailable rather than published with numbers we
 * have not checked — see the note in `@/lib/workflows`.
 */
export function WorkflowRail() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            title="Tell us where it's going"
            description="A Workflow is a destination and the requirements it imposes. Save one and repeat it in a click."
          />
        </Reveal>

        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflows.map((workflow) => {
            const published = workflow.source === "ours" || workflow.lastReviewed !== null;
            const summary = describeRequirement(workflow.requirement);

            return (
              <StaggerItem key={workflow.id}>
                <Card className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[0.9375rem] font-semibold text-ink">{workflow.name}</h3>
                    {!published ? <Badge tone="neutral">Coming soon</Badge> : null}
                  </div>

                  <p className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-ink-muted">
                    {workflow.outcome}
                  </p>

                  {published && summary ? (
                    <p className="mt-3 font-mono text-[0.75rem] text-brand-ink">{summary}</p>
                  ) : (
                    <p className="mt-3 text-[0.75rem] text-ink-subtle">
                      Awaiting verified platform requirements.
                    </p>
                  )}
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}
