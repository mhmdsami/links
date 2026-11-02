import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  // Keep Turbopack rooted at web/ even though the monorepo root has its own
  // package-lock.json, so module tracing does not wander into api/ or app/.
  turbopack: { root: process.cwd() },
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
