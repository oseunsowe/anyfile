"use client";

import { useEffect } from "react";
import {
  CONSENT_STORAGE_KEY,
  parseConsentState,
} from "@/lib/consent";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>> & {
      requestNonPersonalizedAds?: number;
    };
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * The AdSense loader itself is a static <script> in the document head (see
 * app/layout.tsx) so Google's site verification and crawler can see it. This
 * component only decides personalisation: unless the visitor accepted optional
 * cookies, ads are requested as non-personalised.
 */
export function AdProvider() {
  useEffect(() => {
    const apply = () => {
      const consent = parseConsentState(window.localStorage.getItem(CONSENT_STORAGE_KEY));
      const queue = (window.adsbygoogle = window.adsbygoogle || []);
      queue.requestNonPersonalizedAds = consent === "granted" ? 0 : 1;
      const state = consent === "granted" ? "granted" : "denied";
      window.gtag?.("consent", "update", {
        analytics_storage: state,
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
      });
    };

    apply();
    window.addEventListener("afk-consent-change", apply);
    return () => window.removeEventListener("afk-consent-change", apply);
  }, []);

  return null;
}
