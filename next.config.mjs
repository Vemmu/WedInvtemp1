import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the project root (avoids picking up stray lockfiles in parent folders).
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Real photos (jpg/webp/avif) in /public/images are optimised automatically.
    formats: ["image/avif", "image/webp"],
  },
  // three.js ships modern ESM; transpiling keeps older mobile browsers happy.
  transpilePackages: ["three"],
};

export default nextConfig;
