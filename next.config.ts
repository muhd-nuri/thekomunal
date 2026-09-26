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
  // thekomunal.com was a WordPress/Elementor site (Namecheap hosting) until this
  // app took over the domain on 26 Sep 2026. These catch its URLs that people,
  // old posts and Google still hold, so they land somewhere useful instead of a
  // 404. /menu already exists here; a trailing slash is normalised by Next.
  // /booking, /ramadan-ig and /ramadan-dcm used to be Cloudflare Page Rules
  // forwarding to the (now deleted) ramadan subdomain. While those rules exist
  // they win at the edge; once removed, these take over.
  async redirects() {
    return [
      { source: "/reservation", destination: "/reserve", permanent: true },
      { source: "/booking", destination: "/reserve", permanent: true },
      // Campaign links from Ramadan posts: keep attributing them through ?ref=
      // (sanitised to [a-z0-9_-] by src/lib/attribution.ts). Temporary, so the
      // mapping can change without browsers holding on to a cached 308.
      { source: "/ramadan-ig", destination: "/reserve?ref=instagram", permanent: false },
      { source: "/ramadan-dcm", destination: "/reserve?ref=dcm", permanent: false },
      { source: "/thank-you-reservation", destination: "/reserve", permanent: true },
      { source: "/about-us", destination: "/", permanent: true },
      // Past Morehcoustic events and their ticket pages → the events page.
      { source: "/moreh", destination: "/community", permanent: true },
      { source: "/moreh-2", destination: "/community", permanent: true },
      { source: "/morehcoustic-15-march", destination: "/community", permanent: true },
      { source: "/thank-you-morehcoustic", destination: "/community", permanent: true },
      { source: "/tickets-order", destination: "/community", permanent: true },
      { source: "/tickets-checkout", destination: "/community", permanent: true },
      // The WooCommerce shop no longer exists.
      { source: "/shop", destination: "/", permanent: true },
      { source: "/cart", destination: "/", permanent: true },
      { source: "/checkout", destination: "/", permanent: true },
      { source: "/my-account", destination: "/", permanent: true },
      { source: "/sample-page", destination: "/", permanent: true },
    ]
  },
}

export default nextConfig
