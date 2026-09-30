import type { NextConfig } from "next";

/**
 * Static export: the site is deployed as plain files to cPanel shared hosting
 * (Apache). Everything runs client-side, so no Node server is needed. Security
 * headers and the Content-Security-Policy live in public/.htaccess because
 * Next's headers() does not apply to a static export.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
