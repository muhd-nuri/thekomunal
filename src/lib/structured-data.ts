// Komunal: schema.org JSON-LD for the outlet, built only from facts already in src/data.
// Anything the repo does not hold in structured form (geo coordinates, price range,
// region) is left out rather than guessed.
import type { Outlet } from "@/data/outlets"
import { site } from "@/data/site"
import { SITE_URL } from "@/lib/seo"

const EVERY_DAY = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const absolute = (path: string) => new URL(path, SITE_URL).toString()

/** "SH-G-23, …, 40460 Shah Alam" → street + postcode, when the address ends that way. */
function postalAddress(outlet: Outlet) {
  const match = outlet.address.match(/^(.*),\s*(\d{5})\s+(.+)$/)
  return {
    "@type": "PostalAddress",
    streetAddress: match ? match[1] : outlet.address,
    ...(match ? { postalCode: match[2] } : {}),
    addressLocality: outlet.city,
    addressCountry: "MY",
  }
}

export function cafeJsonLd(outlet: Outlet) {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${SITE_URL}/visit#${outlet.slug}`,
    name: outlet.name,
    description: site.description,
    url: absolute("/visit"),
    image: [
      absolute(outlet.image.src),
      absolute("/images/outlets/bukit-rimau-interior.jpg"),
    ],
    address: postalAddress(outlet),
    hasMap: outlet.mapsUrl,
    // site.phone is still marked "confirm canonical number" in src/data/site.ts.
    telephone: site.phone.href.replace(/^tel:/, ""),
    // The published hours ("Open daily 8:30am – 10pm") in the form the booking rules use.
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: EVERY_DAY,
        opens: outlet.opening.opens,
        closes: outlet.opening.closes,
      },
    ],
    hasMenu: absolute("/menu"),
    acceptsReservations: outlet.acceptsReservations,
    sameAs: [site.socials.instagram.url, site.socials.facebook.url],
  }
}
