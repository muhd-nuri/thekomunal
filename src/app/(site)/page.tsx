import { Hero } from "@/components/home/hero"
import { Tape } from "@/components/home/tape"
import { Outlets } from "@/components/home/outlets"
import { SignatureMenu } from "@/components/home/signature-menu"
import { Community } from "@/components/home/community"
import { Reviews } from "@/components/home/reviews"
import { FinalCta } from "@/components/home/final-cta"
import { formatPrice, getSignatureDishes, lowestPrice } from "@/lib/menu"

export default async function HomePage() {
  // Only what the client component renders crosses the boundary.
  const dishes = (await getSignatureDishes()).map((dish) => ({
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
      <Hero />
      <Tape />
      <Outlets />
      {dishes.length > 0 ? <SignatureMenu dishes={dishes} /> : null}
      <Community />
      <Reviews />
      <FinalCta />
    </>
  )
}
