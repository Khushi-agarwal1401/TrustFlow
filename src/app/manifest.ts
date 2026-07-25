import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrustFlow AI",
    short_name: "TrustFlow",
    description: "AI-powered accountability platform for freelance projects",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0A1F",
    theme_color: "#6C63FF",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
