import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The public portfolio demo is deployed beneath the repository name on
  // GitHub Pages. Static export keeps the same app usable without a server.
  output: "export",
  assetPrefix: "/asu-student-hub-demo",
};

export default nextConfig;
