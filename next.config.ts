import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tronweb"],
  // @ts-expect-error Next.js 15 config
  allowedDevOrigins: ["10.138.143.251", "pink-bars-notice.loca.lt", "loca.lt"],
};

export default nextConfig;
