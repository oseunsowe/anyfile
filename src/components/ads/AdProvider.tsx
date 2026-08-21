"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  CONSENT_STORAGE_KEY,
  parseConsentState,
  type ConsentState,
} from "@/lib/consent";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export function AdProvider() {
  const [consent, setConsent] = useState<ConsentState>("unknown");
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

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

  if (!client || consent !== "granted") return null;

  return (
    <Script
      id="adsense-script"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
}
