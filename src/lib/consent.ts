export const CONSENT_STORAGE_KEY = "afk-consent-v1";

export type ConsentState = "unknown" | "granted" | "denied";

export function parseConsentState(value: string | null): ConsentState {
  if (value === "granted" || value === "denied") return value;
  return "unknown";
}
