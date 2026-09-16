// Komunal: outlet facts — the outlet block, footer, reserve flow and Telegram routing all read from here.
// Only Bukit Rimau operates today (client, 2026-09-16). The list shape stays so a future branch is a data change.
import type { CharacterId } from "./characters"

export type Outlet = {
  slug: string
  name: string
  /** Short display name for cards/footer */
  shortName: string
  area: string
  city: string
  address: string
  mapsUrl: string
  /** Search text for the keyless Google Maps embed on /visit. */
  mapQuery: string
  hours: string
  /** Opening window used by the booking rules, 24h "HH:mm" in Asia/Kuala_Lumpur. */
  opening: { opens: string; closes: string }
  acceptsReservations: boolean
  /** Largest party the online form accepts; bigger groups are sent to WhatsApp. */
  maxGuestsOnline: number
  /** Short, factual line about the space (from the current reservation site). */
  spaceNote: string
  telegramThreadId?: number
  delivery: { grab?: string; foodpanda?: string; shopeefood?: string }
  image: { src: string; alt: string; width: number; height: number }
  character: CharacterId
  /** Blob mask variant for the photo */
  blob: 1 | 2 | 3
}

export const outlets: Outlet[] = [
  {
    slug: "bukit-rimau",
    name: "The Komunal Cafe Bukit Rimau",
    shortName: "Komunal Bukit Rimau",
    area: "Seksyen 32",
    city: "Shah Alam",
    address: "SH-G-15, Pangsapuri Perkhidmatan Knox Wawasan, 40460 Shah Alam",
    // Footer link on the previous site; resolves to "The Komunal Cafe", Seksyen 32.
    mapsUrl: "https://goo.gl/maps/zRASWN5jN3YJG85M6",
    // Pins "The Komunal Cafe - Bukit Rimau" (checked 2026-09-17). Google lists the unit as
    // SH-G-23, not SH-G-15 — TODO: confirm the address with the client.
    mapQuery: "The Komunal Cafe Bukit Rimau Shah Alam",
    hours: "Open daily 8:30am – 10pm", // TODO: confirm with the client
    opening: { opens: "08:30", closes: "22:00" },
    acceptsReservations: true,
    maxGuestsOnline: 60,
    spaceNote:
      "Room for groups of up to 60, with a discussion space and whiteboard.",
    delivery: {
      grab: "https://food.grab.com/my/en/restaurant/the-komunal-cafe-bukit-rimau-delivery/1-C3MBGCDVGTXKN6",
      foodpanda: "https://www.foodpanda.my/restaurant/kzw9/the-komunal-cafe", // TODO: verify this is the Bukit Rimau listing
    },
    image: {
      src: "/images/outlets/bukit-rimau.jpg",
      alt: "The Komunal Bukit Rimau storefront at dusk, blue signage over the glass entrance",
      width: 438,
      height: 329,
    },
    character: "barista-pourover",
    blob: 1,
  },
]

/** The outlet the homepage features and the reserve form defaults to. */
export const primaryOutlet = outlets[0]
export const reservableOutlets = outlets.filter((o) => o.acceptsReservations)

export const deliveryLabels: Record<keyof Outlet["delivery"], string> = {
  grab: "GrabFood",
  foodpanda: "foodpanda",
  shopeefood: "ShopeeFood",
}

// A fixed order keeps delivery buttons deterministic and the keys typed.
const DELIVERY_KEYS = ["grab", "foodpanda", "shopeefood"] as const

export function deliveryLinks(outlet: Outlet) {
  return DELIVERY_KEYS.flatMap((key) => {
    const href = outlet.delivery[key]
    return href ? [{ key, href, label: deliveryLabels[key] }] : []
  })
}

export function getOutlet(slug: string) {
  return outlets.find((o) => o.slug === slug)
}
