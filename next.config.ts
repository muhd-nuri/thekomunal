import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // CMS uploads go through server actions (default limit 1 MB). Menu PDFs can be
    // up to 40 MB; nginx needs a matching client_max_body_size.
    serverActions: { bodySizeLimit: "41mb" },
  },
}

export default nextConfig
