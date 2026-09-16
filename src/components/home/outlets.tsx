// Komunal: blob-block cards — every outlet photo is masked by the cup shape and hijacked by its own character.
import { BlobMask } from "@/components/brand/blob-mask"
import { Character } from "@/components/brand/character"
import { CTAButton } from "@/components/cta-button"
import { Emphasis } from "@/components/emphasis"
import { Section } from "@/components/section"
import {
  deliveryLabels,
  familyOutlets,
  komunalOutlets,
  type Outlet,
} from "@/data/outlets"
import { sections } from "@/data/site"

// A fixed order keeps the buttons deterministic and the keys typed.
const DELIVERY_KEYS = ["grab", "foodpanda", "shopeefood"] as const

function deliveryLinks(outlet: Outlet) {
  return DELIVERY_KEYS.flatMap((key) => {
    const href = outlet.delivery[key]
    return href ? [{ key, href, label: deliveryLabels[key] }] : []
  })
}

export function Outlets() {
  return (
    <Section band="cream" id="outlets">
      <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
        {sections.outlets.eyebrow}
      </p>
      <h2 className="mt-3 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
        {sections.outlets.heading}{" "}
        <Emphasis>{sections.outlets.emphasis}</Emphasis>
      </h2>

      {/* Stacked on mobile, 2-up on desktop; nothing clips the characters. */}
      <div className="mt-12 grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-8">
        {komunalOutlets.map((outlet, index) => {
          const delivery = deliveryLinks(outlet)

          return (
            <article key={outlet.slug} className="flex flex-col">
              <BlobMask
                src={outlet.image.src}
                alt={outlet.image.alt}
                width={outlet.image.width}
                height={outlet.image.height}
                variant={outlet.blob}
                aspect="4 / 3"
                sizes="(min-width: 1024px) 600px, 100vw"
                className="w-full"
              >
                <Character
                  id={outlet.character}
                  anchor="bottom-right"
                  offset={{ x: "0%", y: "-2%" }}
                  width="clamp(104px,20vw,190px)"
                  delay={index * 0.08}
                  className="z-20"
                />
              </BlobMask>

              <h3 className="mt-6 text-2xl">{outlet.shortName}</h3>
              <p className="mt-2 max-w-[34ch] text-sm text-ink-muted">
                {outlet.address}
              </p>
              {outlet.hours ? (
                <p className="mt-1 text-sm">{outlet.hours}</p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-auto lg:pt-5">
                {outlet.acceptsReservations ? (
                  <CTAButton
                    variant="primary"
                    href={`/reserve?outlet=${outlet.slug}`}
                    ariaLabel={`Reserve a table at ${outlet.name}`}
                  >
                    Reserve
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
            </article>
          )
        })}
      </div>

      {/* The family: too small to carry a character, so these stay plain blob circles. */}
      <div className="mt-16 md:mt-24">
        <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
          {sections.outlets.family}
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {familyOutlets.map((outlet) => {
            const delivery = deliveryLinks(outlet)

            return (
              <li key={outlet.slug} className="flex items-center gap-4">
                <BlobMask
                  src={outlet.image.src}
                  alt={outlet.image.alt}
                  width={outlet.image.width}
                  height={outlet.image.height}
                  variant={outlet.blob}
                  aspect="1 / 1"
                  sizes="112px"
                  className="w-28 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-lg">{outlet.shortName}</h3>
                  <p className="text-sm text-ink-muted">{outlet.city}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4">
                    <CTAButton
                      variant="link"
                      href={outlet.mapsUrl}
                      external
                      className="text-sm"
                      ariaLabel={`Directions to ${outlet.name}`}
                    >
                      Directions
                    </CTAButton>
                    {delivery.map((link) => (
                      <CTAButton
                        key={link.key}
                        variant="link"
                        href={link.href}
                        external
                        className="text-sm"
                        ariaLabel={`Order from ${outlet.name} on ${link.label}`}
                      >
                        {link.label}
                      </CTAButton>
                    ))}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}
