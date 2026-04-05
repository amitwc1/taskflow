import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Firebase Storage and Google profile images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  // Reduce bundle size — exclude unused server-only modules from client
  serverExternalPackages: [],

  // Strict React mode for catching bugs early
  reactStrictMode: true,
};

export default nextConfig;
