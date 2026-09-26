import type { Metadata } from "next"

import { Hero } from "@/components/home/hero"
import { Tape } from "@/components/home/tape"
import { Outlets } from "@/components/home/outlets"
import { SignatureMenu } from "@/components/home/signature-menu"
import { Community } from "@/components/home/community"
import { Reviews } from "@/components/home/reviews"
import { FinalCta } from "@/components/home/final-cta"
import { getFeaturedEvent } from "@/lib/events"
import { formatPrice, getSignatureDishes, lowestPrice } from "@/lib/menu"
import { pageMetadata } from "@/lib/seo"
import { cafeJsonLd } from "@/lib/structured-data"
import { JsonLd } from "@/components/json-ld"
import { primaryOutlet } from "@/data/outlets"
import { site } from "@/data/site"

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
})

export default async function HomePage() {
  // Only what the client component renders crosses the boundary.
  const [signature, featuredEvent] = await Promise.all([
    getSignatureDishes(),
    getFeaturedEvent(),
  ])
  const dishes = signature.map((dish) => ({
    slug: dish.slug,
    name: dish.name,
    description: dish.description ?? "",
    price:
      dish.prices.length > 1
        ? `from ${formatPrice(lowestPrice(dish))}`
        : formatPrice(lowestPrice(dish)),
    image: dish.image,
  }))

  return (
    <>
      <JsonLd data={cafeJsonLd(primaryOutlet)} />
      <Hero />
      <Tape />
      <Outlets />
      {dishes.length > 0 ? <SignatureMenu dishes={dishes} /> : null}
      {featuredEvent ? <Community featuredEvent={featuredEvent} /> : null}
      <Reviews />
      <FinalCta />
    </>
  )
}
