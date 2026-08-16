"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { primaryNav } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-control px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Log in / Get Started sit here in the reference. They arrive with
              accounts (todo.md P1); until then the CTA points at the thing that
              actually works without an account. */}
          <div className="hidden items-center gap-2 lg:flex">
            <ButtonLink href="/#outcome" variant="solid" size="sm" className="rounded-full px-4">
              Start free
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-control text-ink lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} className="size-5" />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </Container>

      <AnimatePresence initial={false}>
        {open ? (
        <motion.div
          id="mobile-nav"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          className="overflow-hidden border-t border-line bg-surface lg:hidden"
        >
          <Container className="py-4">
            <nav aria-label="Main" className="flex flex-col">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-control px-2 py-3 text-[0.9375rem] font-medium text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
              <ButtonLink
                href="/#outcome"
                variant="solid"
                size="md"
                onClick={() => setOpen(false)}
              >
                Start free
              </ButtonLink>
            </div>
          </Container>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
