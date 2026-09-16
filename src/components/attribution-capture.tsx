"use client"
// Komunal: attribution capture — remembers the first and latest way a visitor arrived, so bookings carry their source.
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import {
  FIRST_TOUCH_COOKIE,
  FIRST_TOUCH_DAYS,
  LAST_TOUCH_COOKIE,
  LAST_TOUCH_DAYS,
  encodeTouch,
  hasSignal,
  touchFromLocation,
} from "@/lib/attribution"

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1)
}

function writeCookie(name: string, value: string, days: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${name}=${value}; Max-Age=${days * 86400}; Path=/; SameSite=Lax${secure}`
}

export function AttributionCapture() {
  const pathname = usePathname()
  const handledLoad = useRef(false)

  useEffect(() => {
    const touch = touchFromLocation({
      url: window.location.href,
      // document.referrer never changes on client navigations, so only trust it on the first load.
      referrer: handledLoad.current ? "" : document.referrer,
      ownHost: window.location.hostname,
      now: Date.now(),
    })
    const firstLoad = !handledLoad.current
    handledLoad.current = true

    // Later client navigations only count when the URL itself carries tracking params.
    if (!firstLoad && !hasSignal(touch)) return

    const value = encodeTouch(touch)
    if (!readCookie(FIRST_TOUCH_COOKIE))
      writeCookie(FIRST_TOUCH_COOKIE, value, FIRST_TOUCH_DAYS)
    if (hasSignal(touch) || !readCookie(LAST_TOUCH_COOKIE)) {
      writeCookie(LAST_TOUCH_COOKIE, value, LAST_TOUCH_DAYS)
    }
  }, [pathname])

  return null
}
