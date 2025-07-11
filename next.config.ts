import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [new URL("https://res.cloudinary.com/jo89/**")] },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
    // nodeMiddleware: true, // Enable Node.js middleware support
  },
  // serverExternalPackages: ["mongodb"],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
