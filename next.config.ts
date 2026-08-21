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

const nextConfig: NextConfig = {
  allowedDevOrigins: parseAllowedDevOrigins(),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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
        ],
      },
    ];
  },
};

export default nextConfig;
