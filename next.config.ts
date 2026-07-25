import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Content-Type", value: "application/javascript" }],
      },
    ]
  },
}

export default nextConfig
