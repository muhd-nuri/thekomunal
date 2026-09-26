// Komunal: robots.txt. /media stays crawlable on purpose — CMS dish and event photos
// live there, and Twitterbot honours robots.txt when fetching preview images.
// /reserve/thank-you is not blocked either: it carries a noindex tag, which a
// crawler can only see if it is allowed to fetch the page.
import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
