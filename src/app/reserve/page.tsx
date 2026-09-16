// Komunal: book a table — big friendly headline and the outlet hijacked by its barista on the left, the white booking card on the right.
import type { Metadata } from "next"
import { Clock, MapPin } from "lucide-react"

import { ReservationForm } from "@/app/reserve/reservation-form"
import { BlobMask } from "@/components/brand/blob-mask"
import { Character } from "@/components/brand/character"
import { WhatsAppIcon } from "@/components/brand/social-icons"
import { Emphasis } from "@/components/emphasis"
import { Section } from "@/components/section"
import { getOutlet, primaryOutlet } from "@/data/outlets"
import { bookingRules, reservationCopy } from "@/data/reservation"
import { site } from "@/data/site"
import { firstBookableDate, klDateOffset, klToday } from "@/lib/booking-time"

export const metadata: Metadata = {
  title: "Reserve a table",
  description: reservationCopy.metaDescription,
}

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<{ outlet?: string | string[] }>
}) {
  const { outlet: slug } = await searchParams
  const requested = typeof slug === "string" ? getOutlet(slug) : undefined
  const outlet = requested?.acceptsReservations ? requested : primaryOutlet

  const now = new Date()
  const nowIso = now.toISOString()
  const today = klToday(now)
  const maxDate = klDateOffset(bookingRules.maxDaysAhead, now)
  const defaultDate = firstBookableDate(outlet.opening, now)

  const copy = reservationCopy
  const [headingLead] = copy.heading.split(copy.headingEmphasis)
  const largeGroupHref = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
    copy.largeGroupWhatsAppText(outlet.shortName)
  )}`

  return (
    <Section band="cream" className="pt-28 md:pt-36">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-12">
        <header className="lg:col-span-5 lg:row-start-1">
          <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] leading-none">
            {headingLead}
            <Emphasis>{copy.headingEmphasis}</Emphasis>
          </h1>
          <p className="mt-5 max-w-[65ch] text-[1.0625rem]">{copy.intro}</p>
        </header>

        <div className="rounded-card bg-surface p-6 md:p-10 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-start">
          <ReservationForm
            outletSlug={outlet.slug}
            nowIso={nowIso}
            today={today}
            maxDate={maxDate}
            defaultDate={defaultDate}
          />
        </div>

        {/* After the form on mobile, so the booking card is reached right after the intro. */}
        <aside
          aria-labelledby="reserve-outlet-heading"
          className="lg:col-span-5 lg:row-start-2"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center lg:flex-col lg:items-start">
            <BlobMask
              src={outlet.image.src}
              alt={outlet.image.alt}
              width={outlet.image.width}
              height={outlet.image.height}
              variant={outlet.blob}
              aspect="4 / 3"
              sizes="(min-width: 640px) 280px, 70vw"
              className="w-[min(280px,70vw)] shrink-0"
            >
              <Character
                id={outlet.character}
                anchor="bottom-right"
                offset={{ x: "18%", y: "-4%" }}
                width="clamp(84px, 12vw, 116px)"
              />
            </BlobMask>

            <div>
              <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
                {copy.outletLabel}
              </p>
              <h2 id="reserve-outlet-heading" className="mt-2 text-2xl">
                {outlet.shortName}
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-[0.9375rem]">
                <li className="flex gap-3">
                  <MapPin
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-brand"
                  />
                  <span className="max-w-[36ch]">{outlet.address}</span>
                </li>
                <li className="flex gap-3">
                  <Clock
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-brand"
                  />
                  <span>{outlet.hours}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-[0.9375rem]">
            <p className="font-extrabold text-brand">{copy.leadTime}</p>
            <p className="text-ink-muted">{copy.requestNote}</p>
            <div className="flex items-start gap-3">
              <WhatsAppIcon className="mt-1 size-5 shrink-0 text-brand" />
              <div>
                <p>{copy.largeGroup(outlet.maxGuestsOnline)}</p>
                <a
                  href={largeGroupHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center font-extrabold text-brand underline underline-offset-4"
                >
                  {copy.whatsappUs}
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Section>
  )
}
