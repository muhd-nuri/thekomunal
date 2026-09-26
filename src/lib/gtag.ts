// Komunal: Google Analytics helper — the two tags the old WordPress site (Site Kit) configured.
/** GA4 property (G-…). */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
/** The Google tag Site Kit installed (GT-…). */
export const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID

/** Every configured ID, GA4 first; empty when analytics is off (local/dev). */
export const GTAG_IDS = [GA_MEASUREMENT_ID, GOOGLE_TAG_ID].filter(
  (id): id is string => Boolean(id)
)

type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    gtag?: Gtag
    dataLayer?: unknown[]
  }
}

export function trackGtag(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return
  window.gtag("event", event, params ?? {})
}
