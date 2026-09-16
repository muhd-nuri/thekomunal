// Komunal: outlet facts — every outlet card, footer list and reserve deep link reads from here.
import type { CharacterId } from "./characters"

export type OutletBrand = "komunal" | "overn" | "pizzahub"

export type Outlet = {
  slug: string
  name: string
  /** Short display name for cards/footer */
  shortName: string
  brand: OutletBrand
  city: string
  address: string
  mapsUrl: string
  hours: string
  acceptsReservations: boolean
  telegramThreadId?: number
  delivery: { grab?: string; foodpanda?: string; shopeefood?: string }
  image: { src: string; alt: string; width: number; height: number }
  character: CharacterId
  /** Blob mask variant for the card photo */
  blob: 1 | 2 | 3
}

export const outlets: Outlet[] = [
  {
    slug: "bukit-rimau",
    name: "The Komunal Cafe Bukit Rimau",
    shortName: "Komunal Bukit Rimau",
    brand: "komunal",
    city: "Shah Alam",
    address: "SH-G-15, Pangsapuri Perkhidmatan Knox Wawasan, 40460 Shah Alam",
    // Footer link on the current site (resolves to "The Komunal Cafe", Seksyen 32) — TODO: verify
    mapsUrl: "https://goo.gl/maps/zRASWN5jN3YJG85M6",
    hours: "Open daily 8:30am – 10pm", // TODO: confirm per outlet
    acceptsReservations: true,
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
    character: "barista-latte",
    blob: 1,
  },
  {
    slug: "bukit-jelutong",
    name: "The Komunal Cafe Bukit Jelutong",
    shortName: "Komunal Bukit Jelutong",
    brand: "komunal",
    city: "Shah Alam",
    address: "4-G-03,D, Vida Shop Office, 40150 Shah Alam",
    mapsUrl: "https://goo.gl/maps/sCHcu37PCwxAY3Cu6", // TODO: verify
    hours: "Open daily 8:30am – 10pm", // TODO: confirm per outlet
    acceptsReservations: true,
    delivery: {
      grab: "https://food.grab.com/my/en/restaurant/the-komunal-cafe-bukit-jelutong-delivery/1-C4CDSCMDLBXXG6",
      shopeefood:
        "https://shopee.com.my/universal-link/now-food/shop/20222832?deep_and_deferred=1&shareChannel=copy_link", // TODO: verify this is the Bukit Jelutong listing
    },
    image: {
      src: "/images/outlets/bukit-jelutong.jpg",
      alt: "The Komunal Bukit Jelutong at night, double-height glass frontage lit from inside",
      width: 427,
      height: 320,
    },
    character: "server-cups",
    blob: 2,
  },
  {
    slug: "komunal-nz",
    name: "The Komunal Cafe New Zealand",
    shortName: "Komunal NZ",
    brand: "komunal",
    city: "Queenstown",
    address: "1/13 Red Oaks Drive, Frankton, Queenstown 9300, New Zealand",
    mapsUrl: "https://maps.app.goo.gl/kqFg36xZGm33nsFo9",
    hours: "", // TODO: confirm NZ hours
    acceptsReservations: false,
    delivery: {},
    image: {
      src: "/images/outlets/komunal-nz.jpg",
      alt: "Counter seating by the window at The Komunal Queenstown with mountains outside",
      width: 362,
      height: 362,
    },
    character: "customer-cup",
    blob: 3,
  },
  {
    slug: "overn",
    name: "övern",
    shortName: "övern",
    brand: "overn",
    city: "Alor Setar",
    address:
      "G1 & G2, Bangunan ARENA, 55, Lorong Perak 12, Kawasan Perusahaan Mergong, 05150 Alor Setar, Kedah",
    mapsUrl: "https://maps.app.goo.gl/1BkBBBt2FwUcapge8",
    hours: "", // TODO: confirm övern hours
    acceptsReservations: false,
    delivery: {},
    image: {
      src: "/images/outlets/overn.jpg",
      alt: "Friends sharing drinks and a meal at a booth in övern, Alor Setar",
      width: 357,
      height: 357,
    },
    character: "customer-bowl",
    blob: 1,
  },
  {
    slug: "pizzahub",
    name: "PizzaHub by Komunal",
    shortName: "PizzaHub Denai Alam",
    brand: "pizzahub",
    city: "Shah Alam",
    address: "8, Jln Elektron U16/H, Denai Alam, 47000 Shah Alam, Selangor",
    mapsUrl: "https://maps.app.goo.gl/cYZLmxiC5qwoNxTH8",
    hours: "", // TODO: confirm PizzaHub hours
    acceptsReservations: false,
    delivery: {
      grab: "https://food.grab.com/my/en/restaurant/pizzahub-by-komunal-jalan-elektron-u16-h-delivery/1-C4LKMAT1EGCYVE",
    },
    image: {
      src: "/images/outlets/pizzahub.jpg",
      alt: "Freshly baked pizzas on the pass at PizzaHub Denai Alam",
      width: 450,
      height: 450,
    },
    character: "chef-pan",
    blob: 2,
  },
]

export const komunalOutlets = outlets.filter(
  (o) => o.brand === "komunal" && o.city === "Shah Alam"
)
export const familyOutlets = outlets.filter((o) => !komunalOutlets.includes(o))
export const reservableOutlets = outlets.filter((o) => o.acceptsReservations)

export const deliveryLabels: Record<keyof Outlet["delivery"], string> = {
  grab: "GrabFood",
  foodpanda: "foodpanda",
  shopeefood: "ShopeeFood",
}

export function getOutlet(slug: string) {
  return outlets.find((o) => o.slug === slug)
}
