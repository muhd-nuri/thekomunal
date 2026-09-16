import { Hero } from "@/components/home/hero"
import { Tape } from "@/components/home/tape"
import { Outlets } from "@/components/home/outlets"
import { SignatureMenu } from "@/components/home/signature-menu"
import { Community } from "@/components/home/community"
import { Reviews } from "@/components/home/reviews"
import { FinalCta } from "@/components/home/final-cta"

export default function HomePage() {
  return (
    <>
      <Hero />
      <Tape />
      <Outlets />
      <SignatureMenu />
      <Community />
      <Reviews />
      <FinalCta />
    </>
  )
}
