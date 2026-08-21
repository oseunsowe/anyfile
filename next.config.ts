import type { NextConfig } from "next";

function parseAllowedDevOrigins() {
  const raw = process.env.NEXT_ALLOWED_DEV_ORIGINS?.trim();
  if (!raw) {
    return ["127.0.0.1", "localhost"];
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Content-Security-Policy.
 *
 * `script-src`/`style-src` include 'unsafe-inline' because Next's App Router
 * streams RSC payloads through inline <script> tags and SSR serializes
 * `style={{...}}` props as inline `style="…"` attributes — both unavoidable
 * without per-request nonce middleware, which is not built yet (see
 * /roadmap "Security hardening and CSP"). Everything else here is a real,
 * enforced allowlist: only these third-party hosts (Google AdSense, ready
 * for when NEXT_PUBLIC_ADSENSE_CLIENT is set) may load a script, an iframe,
 * or receive a fetch from this app in the browser.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.gstatic.com",
  "font-src 'self' data:",
  "connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
  "frame-src https://googleads.g.doubleclick.net https://*.googlesyndication.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  allowedDevOrigins: parseAllowedDevOrigins(),
  async headers() {
    const securityHeaders = [
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    // Skipped in development: Turbopack's HMR client and dev overlay rely on
    // patterns (eval, dev-only websocket) this policy doesn't allow, and the
    // policy exists to protect the deployed site, not the dev server.
    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({ key: "Content-Security-Policy", value: CSP_DIRECTIVES });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
