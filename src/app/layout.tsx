import type { Metadata, Viewport } from "next"
import "./globals.css"
import { brandFont } from "./fonts"
import { site } from "@/data/site"

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://thekomunal.com"
  ),
  title: {
    default: `${site.name} · Specialty coffee for community, Shah Alam`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_MY",
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
