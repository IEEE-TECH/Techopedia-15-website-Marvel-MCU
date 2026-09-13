import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is an imperative Three.js / R3F app. React StrictMode's dev-only
  // double-mount disposes and rebuilds GPU resources (and churns Fast Refresh),
  // which fights the WebGL lifecycle. Off in dev; production is unaffected.
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
