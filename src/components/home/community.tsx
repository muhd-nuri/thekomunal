"use client"
// Komunal: poster wall — real event artwork taped to the blue band, tilted like a noticeboard, never a card grid.
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { CTAButton } from "@/components/cta-button"
import { Section } from "@/components/section"
import type { CommunityEvent } from "@/data/events"
import { sections } from "@/data/site"
import { reveal } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Scrapbook placement, index by index. Mobile is a 2-up stagger; from `md` the
 * posters sit on a 6-col grid (3 + 2) and lean on each other with `translate-x`
 * — a transform, so the grid tracks keep their width (negative margins would
 * stretch the item and break the 4:5 box).
 */
const posterPlacement = [
  "md:col-span-2 md:z-30 md:mt-8",
  "mt-8 md:col-span-2 md:z-20 md:mt-0 md:-translate-x-4",
  "md:col-span-2 md:z-10 md:mt-10 md:-translate-x-8",
  "mt-8 md:col-span-2 md:col-start-2 md:z-20 md:-mt-6 md:translate-x-2",
  // The fifth poster would leave a lonely half-row on a 2-col phone layout.
  "max-md:hidden md:col-span-2 md:z-30 md:-mt-12 md:-translate-x-6",
]

export function Community({
  featuredEvent,
}: {
  featuredEvent: CommunityEvent
}) {
  const reduced = useReducedMotion()

  // One reveal for the whole wall — the posters must not cascade individually.
  // `initial` is identical on both branches on purpose: the server always renders
  // the hidden state, so dropping the motion props under reduced motion would
  // leave that inline opacity:0 stuck (React does not patch attribute mismatches).
  // Instead the reduced branch snaps to the visible state with a zero duration.
  const revealProps = reduced
    ? { animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : {
        whileInView: "visible" as const,
        viewport: { once: true, amount: 0.2 },
      }

  return (
    <Section band="brand" id="community" edge="blob-top">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <p className="text-sm font-extrabold tracking-[0.08em] text-white/70 uppercase">
            {sections.community.eyebrow}
          </p>

          <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
            {sections.community.heading}
          </h2>

          <p className="mt-5 text-sm text-white/75">
            <span className="font-extrabold text-white">
              {featuredEvent.name}
            </span>
            {" · "}
            {featuredEvent.period}
            {featuredEvent.venue ? ` · ${featuredEvent.venue}` : null}
          </p>

          <p className="mt-4 max-w-[60ch] text-white/90">
            {featuredEvent.description}
          </p>

          <div className="mt-8">
            <CTAButton
              variant="on-brand"
              href={sections.community.cta.href}
              external
            >
              {sections.community.cta.label}
            </CTAButton>
          </div>
        </div>

        <motion.div
          variants={reveal}
          initial="hidden"
          {...revealProps}
          className="grid grid-cols-2 gap-x-5 gap-y-6 md:grid-cols-6 md:gap-x-2 md:gap-y-4 lg:col-span-7"
        >
          {featuredEvent.posters
            .slice(0, posterPlacement.length)
            .map((poster, i) => (
              <div
                key={poster.src}
                className={cn("relative", posterPlacement[i])}
                style={{ rotate: `${poster.tilt}deg` }}
              >
                {/* Aspect reserved on the wrapper, so nothing shifts while the poster loads. */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)]">
                  <Image
                    src={poster.src}
                    alt={poster.alt}
                    fill
                    sizes="(min-width: 1024px) 220px, 45vw"
                    className="object-cover"
                  />
                </div>

                {/* Tape corners: cream at 70%, no new colour. Outside the clipped box, above the poster. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2 -left-3 z-10 h-5 w-14 -rotate-[40deg] bg-cream/70"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2 -right-3 z-10 h-5 w-14 rotate-[40deg] bg-cream/70"
                />
              </div>
            ))}
        </motion.div>
      </div>
    </Section>
  )
}
