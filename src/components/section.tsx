// Komunal: colour band — full-bleed blue/cream/white blocks that bite into each other with a blob cut.
import { cn } from "@/lib/utils"

type Band = "cream" | "white" | "brand"

const bandClass: Record<Band, string> = {
  cream: "bg-cream text-ink",
  white: "bg-surface text-ink",
  brand: "bg-brand text-white",
}

/** The cut is drawn in the band's own colour so it reads as the band eating its neighbour. */
const cutClass: Record<Band, string> = {
  cream: "text-cream",
  white: "text-surface",
  brand: "text-brand",
}

// One soft wave, reused upside-down for the bottom cut.
const CUT_PATH =
  "M0 96 C 170 96 250 16 560 11 C 880 6 1080 74 1440 30 L 1440 96 Z"

export function Section({
  band = "cream",
  edge,
  id,
  className,
  containerClassName,
  bleed = false,
  children,
  as: Tag = "section",
}: {
  band?: Band
  edge?: "blob-top" | "blob-bottom"
  id?: string
  className?: string
  containerClassName?: string
  /** Skip the contained max-w-7xl wrapper. */
  bleed?: boolean
  children: React.ReactNode
  as?: "section" | "div" | "footer"
}) {
  return (
    <Tag
      id={id}
      data-band={band}
      className={cn("relative py-section", bandClass[band], className)}
    >
      {edge ? (
        // Absolutely positioned outside the band box: adds no layout height, and z-10
        // keeps it above the neighbouring section. Kept short enough to land inside
        // the neighbour's py-section, so it never covers copy.
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
          className={cn(
            "pointer-events-none absolute inset-x-0 z-10 h-12 w-full md:h-16",
            cutClass[band],
            edge === "blob-top" ? "bottom-full" : "top-full rotate-180"
          )}
        >
          <path d={CUT_PATH} fill="currentColor" />
        </svg>
      ) : null}

      <div
        className={cn(
          "relative",
          !bleed && "mx-auto max-w-7xl px-gutter",
          containerClassName
        )}
      >
        {children}
      </div>
    </Tag>
  )
}
