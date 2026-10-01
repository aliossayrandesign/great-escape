import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stops this site from ever being framed by another site (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          // Stops browsers from guessing content types away from what we declare.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Sends full URLs only to our own origin; just the origin to everyone else.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Forces HTTPS for this domain (and subdomains) for the next 2 years.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // We don't use the camera, mic, or geolocation — deny by default.
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
