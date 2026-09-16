// Komunal: community — the event poster wall at full size, then an invite to host your own gathering.
import type { Metadata } from "next"
import Image from "next/image"

import { BlobMask } from "@/components/brand/blob-mask"
import { Character } from "@/components/brand/character"
import { WhatsAppIcon } from "@/components/brand/social-icons"
import { CTAButton } from "@/components/cta-button"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
import { eventTypes } from "@/data/reservation"
import { getPublishedEvents } from "@/lib/events"
import { primaryOutlet } from "@/data/outlets"
import { communityPage, withMax } from "@/data/pages"
import { hero, sections, site } from "@/data/site"

export const metadata: Metadata = {
  title: communityPage.metaTitle,
  description: communityPage.metaDescription,
  alternates: { canonical: "/community" },
}

export default async function CommunityPage() {
  const events = await getPublishedEvents()
  const hostWhatsApp = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
    communityPage.hostWhatsAppText
  )}`

  return (
    <>
      <Section band="brand" className="pt-28 md:pt-36">
        <PageHeader
          tone="white"
          eyebrow={communityPage.eyebrow}
          heading={communityPage.heading}
          emphasis={communityPage.emphasis}
          intro={communityPage.intro}
        />

        {events.length === 0 ? (
          <p className="mt-12 max-w-[55ch] text-white/90">
            {communityPage.noEvents}
          </p>
        ) : null}

        {events.map((event) => (
          <article
            key={event.slug}
            aria-labelledby={`${event.slug}-heading`}
            className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-10"
          >
            <div className="lg:col-span-4">
              <p className="text-sm font-extrabold tracking-[0.08em] text-white/70 uppercase">
                {event.isUpcoming
                  ? communityPage.upcomingEventLabel
                  : communityPage.pastEventLabel}
                {event.period ? ` · ${event.period}` : ""}
                {event.venue ? ` · ${event.venue}` : ""}
              </p>
              <h2
                id={`${event.slug}-heading`}
                className="mt-3 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]"
              >
                {event.name}
              </h2>
              <p className="mt-2 font-extrabold text-white/90">
                {event.tagline}
              </p>
              {event.venueNote ? (
                <p className="mt-1 text-sm text-white/75">{event.venueNote}</p>
              ) : null}
              <p className="mt-4 max-w-[60ch] text-white/90">
                {event.description}
              </p>
            </div>

            {/* Noticeboard: every poster taped up at its own tilt. */}
            <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:col-span-8">
              {event.posters.map((poster) => (
                <li
                  key={poster.src}
                  className="relative"
                  style={{ rotate: `${poster.tilt}deg` }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)]">
                    <Image
                      src={poster.src}
                      alt={poster.alt}
                      fill
                      sizes="(min-width: 1024px) 260px, (min-width: 640px) 30vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3 bg-cream/70"
                  />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </Section>

      <Section band="cream" edge="blob-top" id="host">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <BlobMask
            src={hero.image.src}
            alt={hero.image.alt}
            width={hero.image.width}
            height={hero.image.height}
            variant={3}
            aspect="4 / 5"
            sizes="(min-width: 1024px) 440px, 90vw"
            className="mx-auto w-full max-w-md lg:col-span-5"
          >
            <Character
              id="server-cups"
              anchor="top-right"
              offset={{ x: "0%", y: "4%" }}
              width="clamp(110px,16vw,190px)"
              className="z-20"
            />
          </BlobMask>

          <div className="lg:col-span-7">
            <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
              {communityPage.hostHeading}
            </h2>
            <p className="mt-4 max-w-[55ch]">
              {withMax(communityPage.hostBody, primaryOutlet.maxGuestsOnline)}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {eventTypes
                .filter((type) => type.value !== "others")
                .map((type) => (
                  <li
                    key={type.value}
                    className="rounded-blob bg-surface px-4 py-2 text-sm font-extrabold text-brand"
                  >
                    {type.label}
                  </li>
                ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <CTAButton variant="primary" href="/reserve">
                {communityPage.hostReserveLabel}
              </CTAButton>
              <a
                href={hostWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 font-extrabold text-brand underline-offset-4 hover:underline"
              >
                <WhatsAppIcon className="size-5" />
                {communityPage.hostWhatsAppLabel}
                <span className="sr-only"> (opens WhatsApp)</span>
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section band="white" edge="blob-top">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
            {communityPage.followHeading}
          </h2>
          <p className="mt-4 text-ink-muted">{communityPage.followBody}</p>
          <div className="mt-8 flex justify-center">
            <CTAButton
              variant="primary"
              href={sections.community.cta.href}
              external
            >
              {sections.community.cta.label}
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  )
}
