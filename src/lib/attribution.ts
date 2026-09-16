// Komunal: where a booking came from — cookie shape, ref sanitising and channel derivation.
// Shared by the client capture (writes cookies) and the server action (reads them).

export const FIRST_TOUCH_COOKIE = "km_ft"
export const LAST_TOUCH_COOKIE = "km_lt"
export const FIRST_TOUCH_DAYS = 90
export const LAST_TOUCH_DAYS = 30

export type Touch = {
  ref?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  gclid?: string
  ttclid?: string
  /** External referrer only */
  referrer?: string
  /** Path + query the visitor landed on */
  landing: string
  /** Epoch ms */
  ts: number
}

export type SourceChannel =
  | "referral"
  | "paid_social"
  | "paid_search"
  | "social"
  | "campaign"
  | "organic_search"
  | "whatsapp"
  | "google_maps"
  | "website"
  | "direct"

export const channelLabels: Record<SourceChannel, string> = {
  referral: "Referral",
  paid_social: "Paid social",
  paid_search: "Paid search",
  social: "Social",
  campaign: "Campaign",
  organic_search: "Organic search",
  whatsapp: "WhatsApp",
  google_maps: "Google Maps",
  website: "Website",
  direct: "Direct",
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const
const CLICK_KEYS = ["fbclid", "gclid", "ttclid"] as const

const PAID_MEDIUMS = new Set([
  "cpc",
  "paid",
  "ppc",
  "paid_social",
  "paidsocial",
])
const SOCIAL_SOURCES = [
  "facebook",
  "fb",
  "instagram",
  "ig",
  "meta",
  "tiktok",
  "twitter",
  "x",
  "threads",
  "linkedin",
  "youtube",
]

/** Lowercase, [a-z0-9_-] only, max 40 chars. Anything else is stripped. */
export function sanitiseRef(value: string | null | undefined) {
  if (!value) return undefined
  const clean = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40)
  return clean || undefined
}

function clip(value: string | null | undefined, max: number) {
  const v = value?.trim()
  return v ? v.slice(0, max) : undefined
}

function hostOf(url: string | undefined) {
  if (!url) return undefined
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return undefined
  }
}

/** Build a touch from the current URL and referrer. `ownHost` filters out internal referrers. */
export function touchFromLocation(input: {
  url: string
  referrer: string
  ownHost: string
  now: number
}): Touch {
  const url = new URL(input.url)
  const params = url.searchParams
  const touch: Touch = {
    landing: `${url.pathname}${url.search}`.slice(0, 300),
    ts: input.now,
  }

  const ref = sanitiseRef(params.get("ref"))
  if (ref) touch.ref = ref
  for (const key of UTM_KEYS) {
    const v = clip(params.get(key), 100)
    if (v) touch[key] = v
  }
  for (const key of CLICK_KEYS) {
    const v = clip(params.get(key), 200)
    if (v) touch[key] = v
  }

  const refHost = hostOf(input.referrer)
  const own = input.ownHost.toLowerCase().replace(/^www\./, "")
  if (refHost && refHost !== own) touch.referrer = input.referrer.slice(0, 300)

  return touch
}

/** True when the visit carries anything worth overwriting the last touch for. */
export function hasSignal(touch: Touch) {
  return Boolean(
    touch.ref ||
    touch.referrer ||
    UTM_KEYS.some((k) => touch[k]) ||
    CLICK_KEYS.some((k) => touch[k])
  )
}

export function encodeTouch(touch: Touch) {
  return encodeURIComponent(JSON.stringify(touch))
}

/** Parse a cookie value defensively; anything malformed is ignored. */
export function decodeTouch(raw: string | undefined | null): Touch | null {
  if (!raw) return null
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>
    if (!value || typeof value !== "object") return null
    const out: Touch = {
      landing:
        typeof value.landing === "string" ? value.landing.slice(0, 300) : "",
      ts: typeof value.ts === "number" ? value.ts : 0,
    }
    const ref = sanitiseRef(
      typeof value.ref === "string" ? value.ref : undefined
    )
    if (ref) out.ref = ref
    for (const key of UTM_KEYS) {
      const v =
        typeof value[key] === "string"
          ? clip(value[key] as string, 100)
          : undefined
      if (v) out[key] = v
    }
    for (const key of CLICK_KEYS) {
      const v =
        typeof value[key] === "string"
          ? clip(value[key] as string, 200)
          : undefined
      if (v) out[key] = v
    }
    if (typeof value.referrer === "string") {
      const v = clip(value.referrer, 300)
      if (v && hostOf(v)) out.referrer = v
    }
    return out
  } catch {
    return null
  }
}

function matchesHost(host: string, needles: string[]) {
  return needles.some((n) =>
    n.endsWith(".")
      ? host.startsWith(n) || host.includes(`.${n}`)
      : host === n || host.endsWith(`.${n}`)
  )
}

/** Channel precedence from the master plan. */
export function deriveChannel(touch: Touch | null): {
  channel: SourceChannel
  detail?: string
} {
  if (!touch) return { channel: "direct" }

  if (touch.ref) return { channel: "referral", detail: touch.ref }

  const medium = touch.utm_medium?.toLowerCase()
  const source = touch.utm_source?.toLowerCase()
  const paid = medium ? PAID_MEDIUMS.has(medium) : false

  if (paid) {
    const social =
      medium === "paid_social" ||
      medium === "paidsocial" ||
      (source ? SOCIAL_SOURCES.includes(source) : false)
    return {
      channel: social ? "paid_social" : "paid_search",
      detail: touch.utm_source,
    }
  }

  if (touch.fbclid) return { channel: "social", detail: "facebook" }
  if (touch.gclid) return { channel: "paid_search", detail: "google" }
  if (touch.ttclid) return { channel: "paid_social", detail: "tiktok" }

  if (touch.utm_source) return { channel: "campaign", detail: touch.utm_source }

  const host = hostOf(touch.referrer)
  if (host) {
    if (matchesHost(host, ["maps.google.", "maps.app.goo.gl", "goo.gl"]))
      return { channel: "google_maps", detail: "google" }
    if (matchesHost(host, ["google."]))
      return { channel: "organic_search", detail: "google" }
    if (matchesHost(host, ["bing.com"]))
      return { channel: "organic_search", detail: "bing" }
    if (matchesHost(host, ["duckduckgo.com"]))
      return { channel: "organic_search", detail: "duckduckgo" }
    if (matchesHost(host, ["instagram.com"]))
      return { channel: "social", detail: "instagram" }
    if (matchesHost(host, ["facebook.com", "fb.com", "fb.me"]))
      return { channel: "social", detail: "facebook" }
    if (matchesHost(host, ["t.co", "twitter.com", "x.com"]))
      return { channel: "social", detail: "x" }
    if (matchesHost(host, ["tiktok.com"]))
      return { channel: "social", detail: "tiktok" }
    if (matchesHost(host, ["threads.net", "threads.com"]))
      return { channel: "social", detail: "threads" }
    if (matchesHost(host, ["wa.me", "whatsapp.com"]))
      return { channel: "whatsapp", detail: "whatsapp" }
    return { channel: "website", detail: host }
  }

  return { channel: "direct" }
}

/** Which click id the touch carries, if any (first match wins). */
export function clickIdOf(touch: Touch | null) {
  if (!touch) return undefined
  for (const key of CLICK_KEYS) {
    if (touch[key]) return { type: key, id: touch[key]! }
  }
  return undefined
}
