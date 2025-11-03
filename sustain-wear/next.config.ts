import type { NextConfig } from "next";

// Added source maps for debugging and Lighthouse checks
const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
};

export default nextConfig;