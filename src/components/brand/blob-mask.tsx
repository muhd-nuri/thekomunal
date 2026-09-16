"use client"
// Komunal: blob block — the cup shape masks a real photo, and characters break out over its edge.
import Image from "next/image"
import { useId, useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { blobMorphPaths, blobPaths, type BlobVariant } from "./blob-paths"
import { cn } from "@/lib/utils"

/** Fraction of the box the blob may occupy — keeps every lobe clear of the straight image edge. */
const BLOB_INSET = 0.96

export function BlobMask({
  src,
  alt,
  width,
  height,
  variant = 1,
  rotate = 0,
  aspect,
  priority = false,
  sizes = "100vw",
  className,
  morph = false,
  children,
}: {
  src: string
  alt: string
  /** Intrinsic image size — used to reserve the aspect ratio. */
  width: number
  height: number
  variant?: BlobVariant
  /** Rotates the clip shape (deg) around its centre. */
  rotate?: number
  /** CSS aspect-ratio override, e.g. "4 / 5". */
  aspect?: string
  /** Hero only — maps to next/image `preload`. */
  priority?: boolean
  sizes?: string
  className?: string
  /** Hero only: slow 12s alternate morph between the two blob-1 states. */
  morph?: boolean
  /** Overlays (e.g. <Character/>) — rendered on top of the image, outside the clip. */
  children?: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { amount: 0.1 })

  // useId can contain characters that are invalid inside url(#…), so strip them.
  const clipId = `komunal-blob-${useId().replace(/[^a-zA-Z0-9]/g, "")}`

  // Only animate while visible; out of view we render the identical static path,
  // so the morph genuinely stops instead of looping off-screen.
  const shouldMorph = morph && inView && !reduced
  const staticPath = morph ? blobMorphPaths[0] : blobPaths[variant]

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={{ aspectRatio: aspect ?? `${width} / ${height}` }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
        className="pointer-events-none absolute h-0 w-0"
      >
        <defs>
          <clipPath
            id={clipId}
            clipPathUnits="objectBoundingBox"
            // Inset slightly so lobes never touch the image box (they would be
            // cut flat there); rotation, if any, happens about the centre.
            transform={`translate(0.5 0.5) scale(${BLOB_INSET}) rotate(${rotate}) translate(-0.5 -0.5)`}
          >
            {shouldMorph ? (
              <motion.path
                d={blobMorphPaths[0]}
                initial={{ d: blobMorphPaths[0] }}
                animate={{ d: blobMorphPaths[1] }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            ) : (
              <path d={staticPath} />
            )}
          </clipPath>
        </defs>
      </svg>

      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={priority}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : undefined}
        className="object-cover"
        style={{ clipPath: `url(#${clipId})` }}
      />

      {children ? (
        // Above the image and outside the clip, so a character can overlap the blob edge.
        <div className="pointer-events-none absolute inset-0">{children}</div>
      ) : null}
    </div>
  )
}
