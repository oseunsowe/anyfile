"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * Motion primitives.
 *
 * plan.md §4.1 asks for motion "used sparingly for state transitions", and §12
 * requires reduced-motion support. Both are enforced here rather than left to
 * each caller: every primitive collapses to a plain fade — or to nothing — when
 * the user has asked for less motion.
 *
 * The house easing is a soft cubic-out. Nothing overshoots or bounces; this is
 * a utility people use under time pressure, not a landing-page showreel.
 */
const EASE = [0.22, 0.61, 0.36, 1] as const;

/**
 * Pre-built motion components.
 *
 * `motion.create(tag)` must never be called during render: it returns a new
 * component type every time, so React unmounts and remounts the subtree on each
 * render, resetting any state inside it. Resolving from a static map keeps the
 * component identity stable.
 */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  p: motion.p,
  span: motion.span,
} as const;

export type MotionTag = keyof typeof MOTION_TAGS;

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const staticVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

/** Fades and lifts into place the first time it scrolls into view. */
export function Reveal({
  as = "div",
  delay = 0,
  className,
  children,
}: {
  as?: MotionTag;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const Component = MOTION_TAGS[as];

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      // `once` matters: re-animating on every scroll pass is distracting and
      // makes long pages feel unstable.
      viewport={{ once: true, amount: 0.2 }}
      variants={reduced ? staticVariants : revealVariants}
      transition={{ delay: reduced ? 0 : delay }}
    >
      {children}
    </Component>
  );
}

/** Parent that releases its children in sequence rather than all at once. */
export function Stagger({
  as = "div",
  step = 0.07,
  className,
  children,
}: {
  as?: MotionTag;
  step?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const Component = MOTION_TAGS[as];

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : step } },
      }}
    >
      {children}
    </Component>
  );
}

/** Child of `Stagger`. Inherits the parent's hidden/visible orchestration. */
export function StaggerItem({
  as = "div",
  className,
  children,
}: {
  as?: MotionTag;
  className?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const Component = MOTION_TAGS[as];

  return (
    <Component className={className} variants={reduced ? staticVariants : revealVariants}>
      {children}
    </Component>
  );
}

export { EASE };
