"use client"
// Komunal: Meta Pixel — queue afterInteractive, library lazyOnload; PageView once per navigation.
import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { PIXEL_ID, trackPixel } from "@/lib/pixel"

export function MetaPixel() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  // The bootstrap snippet fires the initial PageView; this fires one per client navigation.
  useEffect(() => {
    if (!PIXEL_ID) return
    if (lastPath.current === null) {
      lastPath.current = pathname
      return
    }
    if (lastPath.current !== pathname) {
      lastPath.current = pathname
      trackPixel("PageView")
    }
  }, [pathname])

  if (!PIXEL_ID) return null

  return (
    <>
      {/* Meta's standard snippet minus its script injection: the fbq queue, init
          and the first PageView are set up right after hydration... */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,n){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window);fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
      </Script>
      {/* ...and fbevents.js (~230 KB with its config) loads once the page is idle,
          then replays the queue. */}
      <Script
        id="meta-pixel-src"
        strategy="lazyOnload"
        src="https://connect.facebook.net/en_US/fbevents.js"
      />
    </>
  )
}
