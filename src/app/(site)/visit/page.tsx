// Komunal: the Bukit Rimau page — storefront hijacked by its barista, then hours, map, groups, delivery and contact.
import type { Metadata } from "next"
import Image from "next/image"
import { Clock, MapPin, Phone, Users } from "lucide-react"

import { BlobMask } from "@/components/brand/blob-mask"
import { Character } from "@/components/brand/character"
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/social-icons"
import { CTAButton } from "@/components/cta-button"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
import { deliveryLinks, primaryOutlet } from "@/data/outlets"
import { visitPage, withMax } from "@/data/pages"
import { site } from "@/data/site"

export const metadata: Metadata = {
  title: visitPage.metaTitle,
  description: visitPage.metaDescription,
  alternates: { canonical: "/visit" },
}

const linkClass =
  "inline-flex min-h-[44px] items-center gap-3 font-extrabold text-brand underline-offset-4 hover:underline"

export default function VisitPage() {
  const outlet = primaryOutlet
  const delivery = deliveryLinks(outlet)
  const mapQuery = encodeURIComponent(outlet.mapQuery)
  const groupsWhatsApp = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
    visitPage.groupsWhatsAppText
  )}`

  return (
    <>
      <Section band="cream" className="pt-28 md:pt-36">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <PageHeader
              eyebrow={visitPage.eyebrow}
              heading={visitPage.heading}
              emphasis={visitPage.emphasis}
              intro={visitPage.intro}
            />
            <h2 className="mt-10 text-2xl">{outlet.name}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              <li className="flex gap-3">
                <MapPin
                  className="mt-1 size-5 shrink-0 text-brand"
                  aria-hidden
                />
                <address className="max-w-[36ch] not-italic">
                  {outlet.address}
                </address>
              </li>
              <li className="flex gap-3">
                <Clock
                  className="mt-1 size-5 shrink-0 text-brand"
                  aria-hidden
                />
                <span>{outlet.hours}</span>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {outlet.acceptsReservations ? (
                <CTAButton variant="primary" href="/reserve">
                  Reserve a table
                </CTAButton>
              ) : null}
              <CTAButton
                variant="link"
                href={outlet.mapsUrl}
                external
                ariaLabel={`Directions to ${outlet.name}`}
              >
                {visitPage.directionsLabel}
              </CTAButton>
            </div>
          </div>

          <BlobMask
            src={outlet.image.src}
            alt={outlet.image.alt}
            width={outlet.image.width}
            height={outlet.image.height}
            variant={outlet.blob}
            aspect="4 / 3"
            priority
            sizes="(min-width: 1024px) 640px, 100vw"
            className="w-full lg:col-span-7"
          >
            <Character
              id={outlet.character}
              anchor="bottom-right"
              offset={{ x: "0%", y: "-2%" }}
              width="clamp(110px,18vw,200px)"
              className="z-20"
            />
          </BlobMask>
        </div>
      </Section>

      <Section band="white" edge="blob-top" id="getting-here">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
              {visitPage.gettingHere}
            </h2>
            <p className="mt-4 text-ink-muted">
              {outlet.area}, {outlet.city}
            </p>

            <h3 className="mt-10 text-xl">{visitPage.hoursHeading}</h3>
            <p className="mt-2">{outlet.hours}</p>
            <p className="mt-1 text-sm text-ink-muted">{visitPage.hoursNote}</p>

            <div className="mt-6">
              <CTAButton
                variant="link"
                href={outlet.mapsUrl}
                external
                ariaLabel={`Open ${outlet.name} in Google Maps`}
              >
                Open in Google Maps
              </CTAButton>
            </div>
          </div>

          {/* Keyless embed; lazy so it costs nothing until it scrolls into view. */}
          <div className="overflow-hidden rounded-card bg-cream lg:col-span-8">
            <iframe
              title={visitPage.mapTitle}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] h-auto w-full border-0 md:aspect-[16/9]"
            />
          </div>
        </div>
      </Section>

      <Section band="brand" edge="blob-top" id="groups">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="relative mx-auto w-full max-w-md lg:order-2 lg:col-span-5">
            <div className="relative aspect-square overflow-hidden rounded-card">
              <Image
                src="/images/outlets/bukit-rimau-interior.jpg"
                alt="Inside The Komunal Bukit Rimau: rattan chairs, sofa seating, green walls and pendant lights"
                fill
                sizes="(min-width: 1024px) 448px, 90vw"
                className="object-cover"
              />
            </div>
            <Character
              id="line-sip"
              tone="white"
              anchor="top-left"
              offset={{ x: "6%", y: "10%" }}
              width="clamp(90px,14vw,150px)"
              className="z-10"
            />
          </div>

          <div className="lg:order-1 lg:col-span-7">
            <Users className="size-8 text-white/80" aria-hidden />
            <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
              {visitPage.groupsHeading}
            </h2>
            <p className="mt-4 max-w-[55ch] text-white/90">
              {withMax(visitPage.groupsBody, outlet.maxGuestsOnline)}
            </p>
            <p className="mt-2 max-w-[55ch] text-white/75">
              {outlet.spaceNote}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <CTAButton variant="on-brand" href="/reserve">
                Reserve a table
              </CTAButton>
              <a
                href={groupsWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 font-extrabold text-white underline-offset-4 hover:underline"
              >
                <WhatsAppIcon className="size-5" />
                {visitPage.groupsWhatsAppLabel}
                <span className="sr-only"> (opens WhatsApp)</span>
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section band="cream" edge="blob-top">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {delivery.length > 0 ? (
            <div>
              <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.05]">
                {visitPage.deliveryHeading}
              </h2>
              <p className="mt-3 text-ink-muted">{visitPage.deliveryBody}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6">
                {delivery.map((link) => (
                  <CTAButton
                    key={link.key}
                    variant="link"
                    href={link.href}
                    external
                    ariaLabel={`Order from ${outlet.name} on ${link.label}`}
                  >
                    {link.label}
                  </CTAButton>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.05]">
              {visitPage.contactHeading}
            </h2>
            <ul className="mt-4 flex flex-col">
              <li>
                <a href={site.phone.href} className={linkClass}>
                  <Phone className="size-5" aria-hidden />
                  {site.phone.display}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(site.whatsappGreeting)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <WhatsAppIcon className="size-5" />
                  WhatsApp us
                </a>
              </li>
              <li>
                <a
                  href={site.socials.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <InstagramIcon className="size-5" />
                  {site.socials.instagram.handle}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  )
}
