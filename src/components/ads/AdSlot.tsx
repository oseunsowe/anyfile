"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  CONSENT_STORAGE_KEY,
  parseConsentState,
  type ConsentState,
} from "@/lib/consent";

/**
 * Ad placeholder with reserved dimensions.
 *
 * plan.md §7 / §14 rules encoded here:
 *  - The box always reserves its final height, so a late-loading creative
 *    cannot shift layout and damage CLS.
 *  - It is labelled "Advertisement" and styled as inert canvas, so it can never
 *    be mistaken for a Download button.
 *  - Paid tiers render nothing at all.
 *
 * Placement is still the caller's responsibility: never inside a drop zone, and
 * never between upload and the process button.
 */

export type AdFormat = "leaderboard" | "rectangle" | "rail";

const formats: Record<
  AdFormat,
  { className: string; label: string; responsive: boolean }
> = {
  // 728x90 desktop, collapses to 320x100 on mobile.
  leaderboard: {
    className: "h-[100px] w-full max-w-[728px] sm:h-[90px]",
    label: "728x90",
    responsive: true,
  },
  // 300x250 medium rectangle.
  rectangle: {
    className: "h-[250px] w-full max-w-[300px]",
    label: "300x250",
    responsive: false,
  },
  // 300x600 desktop side rail — only rendered where width allows.
  rail: {
    className: "hidden h-[600px] w-[300px] xl:block",
    label: "300x600",
    responsive: false,
  },
};

const SLOT_BY_FORMAT: Record<AdFormat, string | undefined> = {
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE,
  rail: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RAIL,
};

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export function AdSlot({
  format,
  isPaidUser = false,
  className,
}: {
  format: AdFormat;
  /** §6.2 — all paid tiers are ad-free. */
  isPaidUser?: boolean;
  className?: string;
}) {
  const [consent, setConsent] = useState<ConsentState>("unknown");
  const adRef = useRef<HTMLModElement | null>(null);
  const initialized = useRef(false);
  const { className: sizeClass, label, responsive } = formats[format];
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = SLOT_BY_FORMAT[format];
  const adsEnabled = useMemo(
    () => Boolean(client && slot && consent === "granted"),
    [client, consent, slot],
  );

  useEffect(() => {
    const refreshConsent = () => {
      setConsent(parseConsentState(window.localStorage.getItem(CONSENT_STORAGE_KEY)));
    };

    refreshConsent();
    window.addEventListener("afk-consent-change", refreshConsent);

    return () => {
      window.removeEventListener("afk-consent-change", refreshConsent);
    };
  }, []);

  useEffect(() => {
    if (!adsEnabled || initialized.current || !adRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialized.current = true;
    } catch {
      initialized.current = false;
    }
  }, [adsEnabled]);

  if (isPaidUser) return null;

  return (
    <aside
      aria-label="Advertisement"
      className={cn("mx-auto flex flex-col items-center gap-1.5", className)}
    >
      <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-ink-subtle">
        Advertisement
      </span>
      <div
        className={cn(
          "flex items-center justify-center rounded-card border border-dashed border-line",
          "bg-canvas-alt/60 text-xs text-ink-subtle",
          sizeClass,
        )}
      >
        {adsEnabled ? (
          <ins
            ref={adRef}
            className="adsbygoogle block h-full w-full"
            style={{ display: "block" }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format={responsive ? "auto" : undefined}
            data-full-width-responsive={responsive ? "true" : undefined}
          />
        ) : (
          <span className="font-mono">{label}</span>
        )}
      </div>
    </aside>
  );
}
