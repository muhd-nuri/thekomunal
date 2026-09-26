import type { Metadata, Viewport } from "next"
import "./globals.css"
import { brandFont } from "./fonts"
import { site } from "@/data/site"
import { DEFAULT_TITLE, SITE_URL } from "@/lib/seo"

// Pages override these through pageMetadata() (src/lib/seo.ts); this is the fallback
// for anything that does not, e.g. the 404 page.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    title: DEFAULT_TITLE,
    description: site.description,
    siteName: site.name,
    type: "website",
    locale: "en_MY",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: site.description,
  },
}

export const viewport: Viewport = {
  themeColor: "#24247b",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={brandFont.variable}>
      <body className="bg-cream font-body text-ink">{children}</body>
    </html>
  )
}
