import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("@libsql/client");
    return config;
  },
  devIndicators: {
    appIsrStatus: false,
  },
};

export default nextConfig;
