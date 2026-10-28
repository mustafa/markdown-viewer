import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the Electron shell can load the app from disk.
  output: "export",
  // Relative asset URLs: the exported index.html is opened via file:// in
  // Electron, where absolute /_next/... paths would resolve to the disk root.
  assetPrefix: "./",
  images: { unoptimized: true },
  // ~/projects carries a stray package.json + lockfile, so Turbopack's root
  // inference would widen the dev file watcher to every sibling project
  // (and warn about the workspace root on every build). Pin it here.
  turbopack: { root: __dirname },
};

export default nextConfig;
