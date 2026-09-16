// Komunal: Meta Pixel helper — PageView in Phase 1, Lead on successful booking in Phase 2.
export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

type Fbq = (...args: unknown[]) => void

declare global {
  interface Window {
    fbq?: Fbq
  }
}

export type PixelEvent =
  "PageView" | "Lead" | "Contact" | "ViewContent" | (string & {})

export function trackPixel(
  event: PixelEvent,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !window.fbq) return
  if (params) window.fbq("track", event, params)
  else window.fbq("track", event)
}
