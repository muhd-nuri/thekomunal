// Komunal: footer — oversized brand statement; a giant cropped white logotype holds up the whole band.

import { Phone } from "lucide-react"
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/components/brand/social-icons"

import { reservation, site } from "@/data/site"
import { outlets } from "@/data/outlets"
import { Section } from "@/components/section"
import { Logo } from "@/components/brand/logo"
import { logotypePaths } from "@/components/brand/logo-paths"
import { characters } from "@/data/characters"
import { CTAButton } from "@/components/cta-button"

const headingClass = "text-sm font-extrabold uppercase tracking-[0.08em]"
const linkClass =
  "inline-flex items-center gap-2 underline-offset-4 hover:underline"

/** Character box in the logotype's viewBox units: leaning on the "al", feet on the crop line. */
const FOOTER_CHARACTER = (() => {
  const { width, height } = characters["line-chin"]
  // The logotype viewBox starts at (402.35, 428.38), so coordinates are absolute user units.
  const [vx, vy] = logotypePaths.viewBox.split(" ").map(Number)
  const w = 190
  const h = (w * height) / width
  return { x: vx + 760, y: vy + 196 - h, width: w, height: h }
})()

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <Section
      as="footer"
      band="brand"
      bleed
      className="relative overflow-hidden pb-0"
    >
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {/* Outlets */}
          <div>
            <h2 className={headingClass}>Outlets</h2>
            <ul className="mt-5 flex flex-col gap-4">
              {outlets.map((outlet) => (
                <li key={outlet.slug}>
                  <a
                    href={outlet.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-extrabold underline-offset-4 hover:underline"
                  >
                    {outlet.shortName}
                  </a>
                  <p className="text-sm font-medium text-white/80">
                    {outlet.city}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className={headingClass}>Contact</h2>
            <ul className="mt-5 flex flex-col gap-4 font-medium">
              <li>
                <a href={site.phone.href} className={linkClass}>
                  <Phone className="size-5 shrink-0" aria-hidden />
                  {site.phone.display}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${site.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <WhatsAppIcon className="size-5 shrink-0" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={site.socials.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <InstagramIcon className="size-5 shrink-0" />
                  Instagram
                  <span className="text-white/80">
                    {site.socials.instagram.handle}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={site.socials.facebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <FacebookIcon className="size-5 shrink-0" />
                  Facebook
                  <span className="text-white/80">
                    {site.socials.facebook.handle}
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Reserve */}
          <div>
            <h2 className={headingClass}>Reserve</h2>
            <p className="mt-5 max-w-[34ch] font-medium text-white/80">
              {reservation.note}
            </p>
            <CTAButton
              href={reservation.cta.href}
              variant="on-brand"
              className="mt-8"
            >
              {reservation.cta.label}
            </CTAButton>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-16 flex flex-col gap-1 text-sm font-medium text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>{site.entity}</p>
          <p>
            © {year} {site.name}
          </p>
        </div>
      </div>

      {/* Oversized brand statement: the logotype is cropped by the viewport edge
          and the character leans on its letterforms. The character is drawn twice
          inside an SVG that shares the logotype's own coordinate system — a white
          copy for the blue band, and a blue copy clipped to the letterforms — so it
          reads as white-on-blue and blue-on-white at every viewport width. */}
      <div
        className="relative mt-16 h-[clamp(80px,18vw,240px)] md:mt-24"
        style={{ clipPath: "inset(-100vh 0 0 0)" }}
      >
        <Logo
          variant="logotype"
          tone="white"
          title={site.name}
          className="absolute top-0 -left-[5vw] block h-auto w-[110vw] max-w-none"
        />
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={logotypePaths.viewBox}
          className="pointer-events-none absolute top-0 -left-[5vw] block h-auto w-[110vw] max-w-none overflow-visible"
        >
          <defs>
            <clipPath id="footer-logotype-clip">
              {logotypePaths.paths.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </clipPath>
          </defs>
          <image
            href={characters["line-chin"].srcWhite}
            x={FOOTER_CHARACTER.x}
            y={FOOTER_CHARACTER.y}
            width={FOOTER_CHARACTER.width}
            height={FOOTER_CHARACTER.height}
          />
          <g clipPath="url(#footer-logotype-clip)">
            <image
              href={characters["line-chin"].src}
              x={FOOTER_CHARACTER.x}
              y={FOOTER_CHARACTER.y}
              width={FOOTER_CHARACTER.width}
              height={FOOTER_CHARACTER.height}
            />
          </g>
        </svg>
      </div>
    </Section>
  )
}
