// Komunal: the one komunal — a big blob-masked storefront hijacked by its barista, with everything you need to get there.
import { Clock, MapPin, Users } from "lucide-react"

import { BlobMask } from "@/components/brand/blob-mask"
import { Character } from "@/components/brand/character"
import { CTAButton } from "@/components/cta-button"
import { Emphasis } from "@/components/emphasis"
import { Section } from "@/components/section"
import { deliveryLinks, primaryOutlet } from "@/data/outlets"
import { sections } from "@/data/site"

export function Outlets() {
  const outlet = primaryOutlet
  const delivery = deliveryLinks(outlet)

  return (
    <Section band="cream" id="visit">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <BlobMask
          src={outlet.image.src}
          alt={outlet.image.alt}
          width={outlet.image.width}
          height={outlet.image.height}
          variant={outlet.blob}
          aspect="4 / 3"
          sizes="(min-width: 1024px) 640px, 100vw"
          className="w-full lg:order-2 lg:col-span-7"
        >
          <Character
            id={outlet.character}
            anchor="bottom-right"
            offset={{ x: "0%", y: "-2%" }}
            width="clamp(110px,18vw,200px)"
            className="z-20"
          />
        </BlobMask>

        <div className="lg:order-1 lg:col-span-5">
          <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
            {sections.outlets.eyebrow}
          </p>
          <h2 className="mt-3 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
            {sections.outlets.heading}{" "}
            <Emphasis>{sections.outlets.emphasis}</Emphasis>
          </h2>

          <h3 className="mt-8 text-2xl">{outlet.shortName}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            <li className="flex gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-brand" aria-hidden />
              <span className="max-w-[36ch]">{outlet.address}</span>
            </li>
            {outlet.hours ? (
              <li className="flex gap-3">
                <Clock
                  className="mt-1 size-5 shrink-0 text-brand"
                  aria-hidden
                />
                <span>{outlet.hours}</span>
              </li>
            ) : null}
            <li className="flex gap-3">
              <Users className="mt-1 size-5 shrink-0 text-brand" aria-hidden />
              <span className="max-w-[36ch] text-ink-muted">
                {outlet.spaceNote}
              </span>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {outlet.acceptsReservations ? (
              <CTAButton
                variant="primary"
                href="/reserve"
                ariaLabel={`Reserve a table at ${outlet.name}`}
              >
                Reserve a table
              </CTAButton>
            ) : null}
            <CTAButton
              variant="link"
              href={outlet.mapsUrl}
              external
              ariaLabel={`Directions to ${outlet.name}`}
            >
              Directions
            </CTAButton>
          </div>

          {delivery.length > 0 ? (
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-sm text-ink-muted">
                {sections.outlets.deliveryLabel}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-6">
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
        </div>
      </div>
    </Section>
  )
}
