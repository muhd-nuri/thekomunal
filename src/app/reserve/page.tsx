// Komunal: reservation stub (Phase 2 builds the real form) — every Reserve CTA must land somewhere useful today.
import type { Metadata } from "next"
import { Section } from "@/components/section"
import { CTAButton } from "@/components/cta-button"
import { reservation, site } from "@/data/site"
import { getOutlet } from "@/data/outlets"

export const metadata: Metadata = {
  title: "Reserve a table",
  description: reservation.note,
}

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<{ outlet?: string }>
}) {
  const { outlet: outletSlug } = await searchParams
  const outlet = outletSlug ? getOutlet(outletSlug) : undefined
  const text = outlet
    ? reservation.comingSoon.whatsappText.replace(
        "Outlet: —",
        `Outlet: ${outlet.shortName}`
      )
    : reservation.comingSoon.whatsappText
  const waHref = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`

  return (
    <Section band="cream" className="min-h-[70svh]">
      <div className="max-w-2xl">
        <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
          {outlet ? outlet.shortName : "Reservations"}
        </p>
        <h1 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-none">
          {reservation.comingSoon.title}
        </h1>
        <p className="mt-6 max-w-[65ch] text-lg">
          {reservation.comingSoon.body}
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          {reservation.leadTime} {reservation.note}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <CTAButton variant="primary" href={waHref} external>
            WhatsApp us to book
          </CTAButton>
          <CTAButton variant="link" href="/">
            Back to home
          </CTAButton>
        </div>
      </div>
    </Section>
  )
}
