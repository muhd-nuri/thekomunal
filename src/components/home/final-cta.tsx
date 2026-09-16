// Komunal: the cup pattern, full-bleed — a blue band tiled with blob shapes, one shout line, one button, one character leaning in off the photo.
import { BlobMask } from "@/components/brand/blob-mask"
import { Character } from "@/components/brand/character"
import { CTAButton } from "@/components/cta-button"
import { Section } from "@/components/section"
import { blobPaths } from "@/components/brand/blob-paths"
import { reservation } from "@/data/site"

// Rendered once per page, so a literal id keeps this a server component.
const PATTERN_ID = "komunal-final-cta-blobs"

/**
 * No viewBox on purpose: with `patternUnits="userSpaceOnUse"` the user unit is a
 * CSS pixel, so the tile stays a constant 180px whatever the band's height is.
 * A viewBox would letterbox (`meet`) or rescale the tile (`slice`) and the
 * pattern would read as confetti instead of the cup print.
 */
function BlobPattern() {
  // Section renders children inside its padded max-w-7xl container, so the pattern
  // has to climb back out of `py-section` and span the whole band. An <svg> is a
  // replaced element — top/bottom would not stretch it, so the height is explicit.
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute top-[calc(var(--spacing-section)*-1)] left-1/2 h-[calc(100%+var(--spacing-section)*2)] w-screen -translate-x-1/2 text-white opacity-[0.12]"
    >
      <defs>
        <pattern
          id={PATTERN_ID}
          width="180"
          height="180"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-8)"
        >
          <g fill="currentColor">
            {/* blobPaths live in 0..1 space, so scale() is the shape's size in px. */}
            <path d={blobPaths[1]} transform="translate(8 10) scale(58)" />
            <path d={blobPaths[2]} transform="translate(104 4) scale(38)" />
            <path d={blobPaths[3]} transform="translate(96 84) scale(66)" />
            <path d={blobPaths[2]} transform="translate(18 108) scale(46)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${PATTERN_ID})`} />
    </svg>
  )
}

export function FinalCta() {
  return (
    <Section band="brand" id="reserve-cta" className="overflow-hidden">
      <BlobPattern />

      {/* On lg the copy is pushed left so it never runs under the blob photo. */}
      <div className="relative z-10 lg:pr-[clamp(280px,30vw,420px)]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[clamp(3rem,11vw,9rem)] leading-[0.9] tracking-[-0.02em] uppercase">
            {reservation.shout}
          </h2>
          <p className="mt-6 text-lg md:text-xl">{reservation.leadTime}</p>
          <p className="mt-2 text-sm text-white/80">{reservation.note}</p>
          <div className="mt-8 flex justify-center">
            <CTAButton variant="on-brand" href={reservation.cta.href}>
              {reservation.cta.label}
            </CTAButton>
          </div>
        </div>
      </div>

      {/* The character needs a real edge on a flat band: a white blob block holding
          a blob-masked photo. Below the copy on mobile, bleeding off the right on lg. */}
      <div className="relative z-10 mx-auto mt-14 aspect-square w-[min(70vw,320px)] lg:absolute lg:top-1/2 lg:right-[-4vw] lg:mt-0 lg:w-[clamp(220px,28vw,380px)] lg:-translate-y-1/2">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 1 1"
          className="absolute -inset-[3%] h-[106%] w-[106%] text-white"
        >
          <path d={blobPaths[2]} fill="currentColor" />
        </svg>

        <BlobMask
          src="/images/outlets/bukit-rimau-interior.jpg"
          alt="Inside The Komunal Bukit Rimau"
          width={450}
          height={450}
          variant={2}
          aspect="1 / 1"
          sizes="(min-width: 768px) 320px, 45vw"
          className="w-full"
        >
          <Character
            id="customer-cup"
            anchor="bottom-left"
            offset={{ x: "16%", y: "-3%" }}
            width="clamp(120px, 16vw, 200px)"
          />
        </BlobMask>
      </div>
    </Section>
  )
}
