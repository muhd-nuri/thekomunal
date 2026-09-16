"use client"
// Komunal: Meta Pixel — loads afterInteractive, fires PageView once per navigation, nothing else in Phase 1.
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
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
    </Script>
  )
}
