import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tronweb"],
  allowedDevOrigins: ["10.138.143.251", "pink-bars-notice.loca.lt", "loca.lt"],
};

export default nextConfig;
