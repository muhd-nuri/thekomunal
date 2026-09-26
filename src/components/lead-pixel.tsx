"use client"
// Komunal: Lead pixel — one Meta Lead and one GA4 generate_lead per booking code,
// however often the thank-you page is reloaded.
import { useEffect } from "react"

import { trackGtag } from "@/lib/gtag"
import { trackPixel } from "@/lib/pixel"

const POLL_MS = 250
const GIVE_UP_MS = 10_000

/** Keys fired in this tab — guards StrictMode's double effect before localStorage is written. */
const firedThisSession = new Set<string>()

function alreadySent(key: string) {
  try {
    return window.localStorage.getItem(key) !== null
  } catch {
    return false
  }
}

function markSent(key: string) {
  try {
    window.localStorage.setItem(key, new Date().toISOString())
  } catch {
    // Private mode or storage disabled: the in-memory guard still covers this tab.
  }
}

/**
 * Fire once per key, waiting for the tag to exist: the Pixel and gtag load
 * afterInteractive and may arrive after this effect. Returns a cleanup.
 */
function fireOnce(key: string, ready: () => boolean, fire: () => void) {
  if (firedThisSession.has(key) || alreadySent(key)) return () => {}

  const started = Date.now()
  let timer: number | undefined

  const attempt = () => {
    if (firedThisSession.has(key)) return
    if (ready()) {
      firedThisSession.add(key)
      fire()
      markSent(key)
      return
    }
    if (Date.now() - started < GIVE_UP_MS) {
      timer = window.setTimeout(attempt, POLL_MS)
    }
  }

  attempt()
  return () => window.clearTimeout(timer)
}

export function LeadPixel({ code }: { code: string }) {
  useEffect(() => {
    const stopMeta = fireOnce(
      `km_lead_${code}`,
      () => Boolean(window.fbq),
      () =>
        trackPixel(
          "Lead",
          { content_name: "Table reservation" },
          { eventID: code }
        )
    )
    const stopGa = fireOnce(
      `km_ga_lead_${code}`,
      () => Boolean(window.gtag),
      () => trackGtag("generate_lead", { lead_source: "table_reservation" })
    )
    return () => {
      stopMeta()
      stopGa()
    }
  }, [code])

  return null
}
