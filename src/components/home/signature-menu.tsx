"use client"
// Komunal: magazine spread — one oversized dish photo, a numbered list that swaps it, no grey cards anywhere.
import { useState } from "react"
import Image from "next/image"
import { CTAButton } from "@/components/cta-button"
import { Section } from "@/components/section"
import { signatureDishes } from "@/data/menu"
import { sections } from "@/data/site"
import { cn } from "@/lib/utils"

export function SignatureMenu() {
  const [active, setActive] = useState(0)

  return (
    <Section band="white" id="menu" edge="blob-top">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
        {/* All eight stay mounted and crossfade, so swapping never remounts or flickers.
            Sticky lives on the wrapper: `fill` needs a relative/absolute parent. */}
        <div className="lg:sticky lg:top-24">
          <div className="relative aspect-square overflow-hidden rounded-card">
            {signatureDishes.map((dish, index) => (
              <Image
                key={dish.slug}
                src={dish.image.src}
                alt={index === active ? dish.image.alt : ""}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={cn(
                  "object-cover transition-opacity duration-[250ms] ease-out",
                  index === active ? "opacity-100" : "opacity-0"
                )}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
            {sections.menu.eyebrow}
          </p>
          <h2 className="mt-3 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
            {sections.menu.heading}
          </h2>
          <p className="mt-4 max-w-[46ch] text-ink-muted">
            {sections.menu.intro}
          </p>

          <ol className="mt-8">
            {signatureDishes.map((dish, index) => {
              const isActive = index === active

              return (
                <li key={dish.slug}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    className="flex min-h-[56px] w-full items-baseline gap-4 py-2 text-left"
                  >
                    <span className="w-9 shrink-0 text-base font-extrabold text-brand tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span className="block text-xl font-extrabold md:text-2xl">
                        {dish.name}
                      </span>
                      {isActive ? (
                        <span className="mt-1 block max-w-[42ch] text-sm text-ink-muted">
                          {dish.description}
                        </span>
                      ) : null}
                      {/* Brand underline marks the active row — no second colour, no grey fill. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-2 block h-[3px] rounded-blob bg-brand transition-all duration-300 ease-out-quint",
                          isActive ? "w-16 opacity-100" : "w-0 opacity-0"
                        )}
                      />
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="mt-10">
            <CTAButton variant="primary" href={sections.menu.cta.href}>
              {sections.menu.cta.label}
            </CTAButton>
          </div>
        </div>
      </div>
    </Section>
  )
}
