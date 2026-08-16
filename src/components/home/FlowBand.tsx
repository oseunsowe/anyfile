"use client";

import { motion, useReducedMotion } from "motion/react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { LogoMark } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { EASE } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

/**
 * The compatibility-layer diagram (plan.md §0): what people have on the left,
 * where it needs to go on the right, us in the middle.
 *
 * This is the one place in the product where motion is doing real work rather
 * than decorating — the animated flow is the explanation. Everything still
 * reads correctly frozen, which is what reduced-motion users get.
 */

type Node = { label: string; icon: IconName; tone: string };

const INPUTS: Node[] = [
  { label: "PDF", icon: "filePdfDuo", tone: "text-cat-pdf bg-cat-pdf-soft" },
  { label: "HEIC", icon: "imageDuo", tone: "text-cat-smart bg-cat-smart-soft" },
  { label: "JPG / PNG", icon: "imageDuo", tone: "text-cat-image bg-cat-image-soft" },
  { label: "Scans", icon: "scanDuo", tone: "text-cat-ai bg-cat-ai-soft" },
];

const OUTPUTS: Node[] = [
  { label: "Job portal", icon: "sealCheckDuo", tone: "text-cat-pdf bg-cat-pdf-soft" },
  { label: "Email", icon: "flowArrowDuo", tone: "text-cat-ai bg-cat-ai-soft" },
  { label: "Marketplace", icon: "lightningDuo", tone: "text-cat-smart bg-cat-smart-soft" },
  { label: "Web & print", icon: "cropDuo", tone: "text-cat-image bg-cat-image-soft" },
];

/** Cubic connectors from each column into the centre, in a 100×60 viewBox. */
const ROWS = [10, 26, 42, 58];
const CENTRE_Y = 34;

export function FlowBand() {
  const reduced = useReducedMotion();

  return (
    <section className="overflow-hidden border-y border-line bg-surface py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-ink sm:text-[1.75rem]">
            Anything in. Ready for anywhere.
          </h2>
          <p className="mt-2 text-[0.9375rem] text-ink-muted">
            You bring the file you have. We deal with everything between it and
            where it needs to go.
          </p>
        </div>

        <div className="relative mt-12">
          {/* Connector layer, behind the tiles. */}
          <svg
            viewBox="0 0 100 68"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 hidden size-full text-brand/35 md:block"
          >
            {ROWS.map((y, index) => (
              <g key={y}>
                <FlowPath d={`M 14 ${y} C 30 ${y}, 34 ${CENTRE_Y}, 46 ${CENTRE_Y}`} delay={index * 0.2} reduced={reduced} />
                <FlowPath d={`M 54 ${CENTRE_Y} C 66 ${CENTRE_Y}, 70 ${y}, 86 ${y}`} delay={index * 0.2 + 0.4} reduced={reduced} />
              </g>
            ))}
          </svg>

          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-4">
            <NodeColumn nodes={INPUTS} align="start" label="What you have" />

            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mx-auto flex size-20 items-center justify-center rounded-panel border border-line bg-surface shadow-lg"
            >
              <LogoMark className="size-9 text-brand" />
            </motion.div>

            <NodeColumn nodes={OUTPUTS} align="end" label="Where it's going" />
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * A dashed path whose offset animates, reading as flow along the line.
 * Frozen dashes still communicate "connected", so stillness costs nothing.
 */
function FlowPath({
  d,
  delay,
  reduced,
}: {
  d: string;
  delay: number;
  reduced: boolean | null;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.4"
      strokeDasharray="1.6 1.8"
      vectorEffect="non-scaling-stroke"
      {...(reduced
        ? {}
        : {
            animate: { strokeDashoffset: [0, -6.8] },
            transition: { duration: 2.4, ease: "linear", repeat: Infinity, delay },
          })}
    />
  );
}

function NodeColumn({
  nodes,
  align,
  label,
}: {
  nodes: Node[];
  align: "start" | "end";
  label: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div>
      <p
        className={cn(
          "mb-3 text-[0.6875rem] font-medium uppercase tracking-wider text-ink-subtle",
          align === "end" ? "md:text-right" : "md:text-left",
        )}
      >
        {label}
      </p>
      <ul className="space-y-2.5">
        {nodes.map((node, index) => (
          <motion.li
            key={node.label}
            initial={reduced ? false : { opacity: 0, x: align === "start" ? -12 : 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE, delay: index * 0.08 }}
            className={cn(
              "flex items-center gap-2.5 rounded-card border border-line bg-surface px-3 py-2.5 shadow-sm",
              align === "end" && "md:flex-row-reverse md:text-right",
            )}
          >
            <span className={cn("inline-flex size-8 items-center justify-center rounded-[0.5rem]", node.tone)}>
              <Icon name={node.icon} className="size-[1.125rem]" />
            </span>
            <span className="text-[0.8125rem] font-medium text-ink">{node.label}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
