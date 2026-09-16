"use client"
// Komunal: character hijack — a character must always overlap a real photo edge, never float on flat colour.
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { characters, type CharacterId } from "@/data/characters"
import { easeOut } from "@/lib/motion"
import { cn } from "@/lib/utils"

export type CharacterAnchor =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "right-edge"
  | "left-edge"
  | "bottom-edge"

/** Anchors whose character enters from the left, so the peek slides the other way. */
const LEFT_ANCHORS: ReadonlySet<CharacterAnchor> = new Set([
  "top-left",
  "bottom-left",
  "left-edge",
])

/** Extra class needed to centre the character on an edge anchor. */
const anchorClass: Record<CharacterAnchor, string> = {
  "top-right": "",
  "top-left": "",
  "bottom-right": "",
  "bottom-left": "",
  "right-edge": "-translate-y-1/2",
  "left-edge": "-translate-y-1/2",
  "bottom-edge": "-translate-x-1/2",
}

export function Character({
  id,
  anchor = "top-right",
  offset,
  width = "clamp(110px, 20vw, 200px)",
  flip = false,
  className,
  delay = 0,
  tone = "blue",
}: {
  id: CharacterId
  anchor?: CharacterAnchor
  /** CSS lengths. Positive pushes the character OUTWARD, past the parent edge. */
  offset?: { x?: string; y?: string }
  /** CSS width, e.g. "clamp(120px, 22vw, 220px)". */
  width?: string
  flip?: boolean
  className?: string
  delay?: number
  /** Line characters only: "white" swaps to the white-stroke twin for blue bands. */
  tone?: "blue" | "white"
}) {
  const asset = characters[id]
  const src = tone === "white" && asset.srcWhite ? asset.srcWhite : asset.src
  const reduced = useReducedMotion()

  // Outward = a negative inset. On edge anchors the cross-axis offset slides the
  // character along that edge instead (positive = down / right).
  const x = offset?.x ?? "8%"
  const y = offset?.y ?? "8%"
  const out = (value: string) => `calc(-1 * (${value}))`
  const along = (value: string | undefined) =>
    value ? `calc(50% + (${value}))` : "50%"

  const position: React.CSSProperties = { width }
  switch (anchor) {
    case "top-right":
      position.top = out(y)
      position.right = out(x)
      break
    case "top-left":
      position.top = out(y)
      position.left = out(x)
      break
    case "bottom-right":
      position.bottom = out(y)
      position.right = out(x)
      break
    case "bottom-left":
      position.bottom = out(y)
      position.left = out(x)
      break
    case "right-edge":
      position.top = along(offset?.y)
      position.right = out(x)
      break
    case "left-edge":
      position.top = along(offset?.y)
      position.left = out(x)
      break
    case "bottom-edge":
      position.bottom = out(y)
      position.left = along(offset?.x)
      break
  }

  const from = LEFT_ANCHORS.has(anchor) ? -24 : 24

  // Same props on server and client (no hydration mismatch); under reduced
  // motion the transition collapses to 0s so the character simply appears.
  const motionProps = {
    initial: { x: from, rotate: -3, opacity: 0 },
    whileInView: { x: 0, rotate: 0, opacity: 1 },
    // "some" (any pixel visible), not an amount threshold: a character that
    // hangs off the photo — and off a 375px screen — would never reach 30%.
    viewport: { once: true },
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.6, ease: easeOut, delay },
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-10 select-none",
        anchorClass[anchor],
        className
      )}
      style={position}
    >
      <motion.div {...motionProps}>
        {/* Aspect reserved from the registry so the character never shifts layout. */}
        <div
          className="relative w-full"
          style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
        >
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 768px) 240px, 45vw"
            className={cn("object-contain", flip && "-scale-x-100")}
          />
        </div>
      </motion.div>
    </div>
  )
}
