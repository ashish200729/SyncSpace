import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Explicitly set the workspace root to this directory (frontend/)
    // to prevent Turbopack from picking up stale lockfiles in parent dirs.
    root: __dirname,
  },
};

export default nextConfig;