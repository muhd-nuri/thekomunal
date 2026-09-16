// Komunal: request received — a blue shout, the booking code in a white pill, and a character hijacking the café photo.
import type { Metadata } from "next"
import { eq } from "drizzle-orm"
import { CalendarDays, MapPin, PartyPopper, Users } from "lucide-react"

import { BlobMask } from "@/components/brand/blob-mask"
import { Character } from "@/components/brand/character"
import { CTAButton } from "@/components/cta-button"
import { LeadPixel } from "@/components/lead-pixel"
import { Section } from "@/components/section"
import { getOutlet } from "@/data/outlets"
import { eventTypeLabel, reservationCopy } from "@/data/reservation"
import { hero } from "@/data/site"
import { BOOKING_CODE_RE } from "@/lib/booking-code"
import { formatSlotLong } from "@/lib/booking-time"

export const metadata: Metadata = {
  title: "Booking request received",
  robots: { index: false, follow: false },
}

const copy = reservationCopy.thankYou

/** Non-sensitive columns only: codes are short, so never render who booked. */
async function findBooking(code: string) {
  try {
    const [{ db }, { reservations }] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ])
    const [row] = await db
      .select({
        reservedAt: reservations.reservedAt,
        guests: reservations.guests,
        outletSlug: reservations.outletSlug,
        eventType: reservations.eventType,
      })
      .from(reservations)
      .where(eq(reservations.code, code))
      .limit(1)
    return row ?? null
  } catch (error) {
    console.error("[thank-you] could not load booking", error)
    return null
  }
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>
}) {
  const { code: rawCode } = await searchParams
  const code =
    typeof rawCode === "string" && BOOKING_CODE_RE.test(rawCode)
      ? rawCode
      : null
  const booking = code ? await findBooking(code) : null
  const outlet = booking ? getOutlet(booking.outletSlug) : undefined

  const summary = booking
    ? [
        {
          key: "outlet",
          icon: MapPin,
          text: outlet?.shortName ?? booking.outletSlug,
        },
        {
          key: "when",
          icon: CalendarDays,
          text: formatSlotLong(booking.reservedAt),
        },
        { key: "guests", icon: Users, text: copy.guests(booking.guests) },
        ...(booking.eventType
          ? [
              {
                key: "event",
                icon: PartyPopper,
                text: eventTypeLabel(booking.eventType),
              },
            ]
          : []),
      ]
    : []

  return (
    <Section band="brand" className="overflow-x-clip pt-28 md:pt-36">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="text-sm font-extrabold tracking-[0.08em] text-white uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 text-[clamp(3rem,11vw,9rem)] leading-[0.9] tracking-[-0.02em] uppercase">
            {copy.heading}
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg">
            {booking ? copy.body : copy.fallbackBody}
          </p>

          {booking && code ? (
            <>
              <div className="mt-8 inline-flex animate-in flex-col gap-1 rounded-card bg-surface px-7 py-5 text-brand duration-700 ease-out-quint fade-in slide-in-from-bottom-3 motion-reduce:animate-none">
                <span className="text-sm font-extrabold tracking-[0.08em] uppercase">
                  {copy.codeLabel}
                </span>
                <span className="text-[clamp(2.25rem,6vw,3.5rem)] leading-none font-extrabold tracking-[0.04em] tabular-nums">
                  {code}
                </span>
              </div>
              <p className="mt-3 max-w-[48ch] text-sm text-white/80">
                {copy.codeHint}
              </p>

              <h2 className="mt-8 text-sm font-extrabold tracking-[0.08em] uppercase">
                {copy.summaryLabel}
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {summary.map(({ key, icon: Icon, text }) => (
                  <li key={key} className="flex items-center gap-3">
                    <Icon aria-hidden="true" className="size-5 shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <CTAButton variant="on-brand" href="/">
              {copy.home}
            </CTAButton>
            <CTAButton variant="link" href="/menu" className="text-white">
              {copy.menu}
            </CTAButton>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[420px] pr-10 lg:col-span-5 lg:max-w-none lg:pr-12">
          <BlobMask
            src={hero.image.src}
            alt={hero.image.alt}
            width={hero.image.width}
            height={hero.image.height}
            variant={2}
            aspect="4 / 5"
            sizes="(min-width: 1024px) 420px, 80vw"
            className="w-full"
          >
            <Character
              id="server-cups"
              anchor="right-edge"
              offset={{ x: "14%", y: "18%" }}
              width="clamp(110px, 16vw, 190px)"
            />
          </BlobMask>
        </div>
      </div>

      {booking && code ? <LeadPixel code={code} /> : null}
    </Section>
  )
}
