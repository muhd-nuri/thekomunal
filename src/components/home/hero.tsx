// Komunal: character hijack — the shout sits on blue, the photo is a blob block, and a barista climbs out over its edge.
import { BlobMask } from "@/components/brand/blob-mask"
import { Character } from "@/components/brand/character"
import { CTAButton } from "@/components/cta-button"
import { Section } from "@/components/section"
import { hero } from "@/data/site"

export function Hero() {
  return (
    <Section
      band="brand"
      id="top"
      // The photo bleeds past the right gutter on lg; clip so it never adds a scrollbar.
      className="overflow-x-clip pt-24 md:pt-36"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[45fr_55fr] lg:gap-10">
        <div>
          <p className="text-sm font-extrabold tracking-[0.08em] text-white/80 uppercase">
            {hero.eyebrow}
          </p>

          {/* The hero is the LCP block: the heading reveals on mount with a CSS
              animation (same 20px / 0.55s / ease-out-quint as `reveal`), so it
              is visible before — and without — JavaScript. */}
          <h1 className="mt-4 animate-in text-[clamp(3rem,11vw,9rem)] leading-[0.9] tracking-[-0.02em] uppercase duration-550 ease-out-quint slide-in-from-bottom-5 fade-in motion-reduce:animate-none">
            {hero.shout}
          </h1>

          <p className="mt-6 max-w-[38ch] text-lg md:text-xl">{hero.support}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <CTAButton variant="on-brand" href={hero.primary.href}>
              {hero.primary.label}
            </CTAButton>
            <CTAButton
              variant="link"
              href={hero.secondary.href}
              className="text-white"
            >
              {hero.secondary.label}
            </CTAButton>
          </div>
        </div>

        {/* Bleeds off the right edge on desktop; a definite lg height stops the 4:5
            crop from turning into a 900px-tall column. */}
        <div className="lg:-mr-[8vw]">
          <BlobMask
            src={hero.image.src}
            alt={hero.image.alt}
            width={hero.image.width}
            height={hero.image.height}
            variant={1}
            morph
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            aspect="4 / 5"
            className="max-h-[52vh] w-full lg:h-[clamp(400px,42vw,580px)] lg:max-h-none"
          >
            <Character
              id="barista-latte"
              anchor="bottom-left"
              // Aimed at the blob's lower-left curve, not the container corner.
              offset={{ x: "5%", y: "-1%" }}
              width="clamp(132px,22vw,214px)"
            />
          </BlobMask>
        </div>
      </div>
    </Section>
  )
}
