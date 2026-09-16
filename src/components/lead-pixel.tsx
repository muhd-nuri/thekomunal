"use client"
// Komunal: Lead pixel — one Meta Lead per booking code, however often the thank-you page is reloaded.
import { useEffect } from "react"

import { trackPixel } from "@/lib/pixel"

const POLL_MS = 250
const GIVE_UP_MS = 10_000
const keyFor = (code: string) => `km_lead_${code}`

/** Codes fired in this tab — guards StrictMode's double effect before localStorage is written. */
const firedThisSession = new Set<string>()

function alreadySent(code: string) {
  try {
    return window.localStorage.getItem(keyFor(code)) !== null
  } catch {
    return false
  }
}

function markSent(code: string) {
  try {
    window.localStorage.setItem(keyFor(code), new Date().toISOString())
  } catch {
    // Private mode or storage disabled: the in-memory guard still covers this tab.
  }
}

export function LeadPixel({ code }: { code: string }) {
  useEffect(() => {
    if (firedThisSession.has(code) || alreadySent(code)) return

    const started = Date.now()
    let timer: number | undefined

    const attempt = () => {
      if (firedThisSession.has(code)) return
      if (window.fbq) {
        firedThisSession.add(code)
        trackPixel(
          "Lead",
          { content_name: "Table reservation" },
          { eventID: code }
        )
        markSent(code)
        return
      }
      // The pixel script loads afterInteractive and may arrive after this effect.
      if (Date.now() - started < GIVE_UP_MS) {
        timer = window.setTimeout(attempt, POLL_MS)
      }
    }

    attempt()
    return () => window.clearTimeout(timer)
  }, [code])

  return null
}
