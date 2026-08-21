"use client";

import { useState } from "react";
import {
  CONSENT_STORAGE_KEY,
  parseConsentState,
  type ConsentState,
} from "@/lib/consent";

function saveConsent(next: Exclude<ConsentState, "unknown">) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, next);
  window.dispatchEvent(new Event("afk-consent-change"));
}

export function ConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>(() => {
    if (typeof window === "undefined") return "unknown";
    return parseConsentState(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  });

  if (consent !== "unknown") return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto w-full max-w-2xl rounded-card border border-line bg-surface p-4 shadow-lg sm:inset-x-6 sm:bottom-6">
      <p className="text-sm font-semibold text-ink">Cookie and ad consent</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        We use essential storage for file processing and optional ad cookies for
        funding free tools. You can change this choice any time in your browser
        site settings.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            saveConsent("denied");
            setConsent("denied");
          }}
          className="rounded-control border border-line px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-canvas-alt"
        >
          Reject optional cookies
        </button>
        <button
          type="button"
          onClick={() => {
            saveConsent("granted");
            setConsent("granted");
          }}
          className="rounded-control bg-solid px-3 py-2 text-xs font-medium text-ink-inverse transition-opacity hover:opacity-90"
        >
          Accept optional cookies
        </button>
      </div>
    </aside>
  );
}
