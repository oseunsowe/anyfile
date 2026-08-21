"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/brand/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Entitlements } from "@/lib/entitlements";
import { getPlan } from "@/lib/plans";
import { primaryNav } from "@/lib/site";

export function SiteHeader({ entitlements }: { entitlements: Entitlements }) {
  const [open, setOpen] = useState(false);
  const planName = getPlan(entitlements.plan).name;

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

          <div className="hidden items-center gap-2 lg:flex">
            {entitlements.loggedIn ? (
              <>
                <span className="rounded-full border border-line px-3 py-1.5 text-[0.8125rem] font-medium text-ink-muted">
                  {planName} plan
                </span>
                <ButtonLink href="/demo" variant="outline" size="sm" className="rounded-full px-4">
                  Demo workspace
                </ButtonLink>
                <form action="/api/auth/logout" method="post">
                  <Button type="submit" variant="ghost" size="sm" className="rounded-full px-4">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm" className="rounded-full px-4">
                  Demo login
                </ButtonLink>
                <ButtonLink href="/#outcome" variant="solid" size="sm" className="rounded-full px-4">
                  Start free
                </ButtonLink>
              </>
            )}
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
              {entitlements.loggedIn ? (
                <>
                  <span className="px-2 text-[0.8125rem] font-medium text-ink-muted">
                    {planName} plan
                  </span>
                  <ButtonLink
                    href="/demo"
                    variant="outline"
                    size="md"
                    onClick={() => setOpen(false)}
                  >
                    Demo workspace
                  </ButtonLink>
                  <form action="/api/auth/logout" method="post">
                    <Button type="submit" variant="ghost" size="md" className="w-full">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <ButtonLink
                    href="/login"
                    variant="ghost"
                    size="md"
                    onClick={() => setOpen(false)}
                  >
                    Demo login
                  </ButtonLink>
                  <ButtonLink
                    href="/#outcome"
                    variant="solid"
                    size="md"
                    onClick={() => setOpen(false)}
                  >
                    Start free
                  </ButtonLink>
                </>
              )}
            </div>
          </Container>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
