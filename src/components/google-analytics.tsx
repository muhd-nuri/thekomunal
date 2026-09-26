"use client"
// Komunal: Google Analytics — one gtag.js load configuring both tags the old WordPress site used
// (GA4 G-SDYJQFKYKB and Site Kit's Google tag GT-MQBK3NN9). Renders nothing when neither ID is set.
import Script from "next/script"

import { GTAG_IDS } from "@/lib/gtag"

export function GoogleAnalytics() {
  if (GTAG_IDS.length === 0) return null

  // `config` sends the first page_view. Client-side navigations are counted by GA4's
  // enhanced measurement ("page changes based on browser history events"), which
  // listens to the App Router's history.pushState — so no manual page_view here,
  // which would count every navigation twice.
  const config = GTAG_IDS.map(
    (id) => `gtag('config',${JSON.stringify(id)});`
  ).join("")

  return (
    <>
      {/* The queue exists right after hydration, so config, the page view and a
          booking's generate_lead are captured immediately. */}
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${config}`}
      </Script>
      {/* afterInteractive, not lazyOnload: GA only sees client navigations once
          gtag.js is running (its history listener), so a late load would miss
          early clicks. Measured on 26 Sep 2026, lazyOnload bought no Lighthouse
          TBT/LCP gain — the script is async and never blocks rendering. */}
      <Script
        id="gtag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GTAG_IDS[0])}`}
      />
    </>
  )
}
