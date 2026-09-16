"use client"
// Komunal: tape marquee — a white poster strip taped across a blue band, brand shouts on repeat.
import { useRef } from "react"
import { useInView } from "framer-motion"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"

export function TapeMarquee({
  phrases,
  className,
  speed = 40,
}: {
  phrases: readonly string[]
  className?: string
  /** Seconds per loop. */
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0 })

  const copy = (duplicate: boolean) => (
    <div
      aria-hidden={duplicate || undefined}
      className="flex shrink-0 items-center"
    >
      {phrases.map((phrase) => (
        <span key={phrase} className="flex items-center">
          {phrase}
          <Logo
            variant="logomark"
            className="mx-[0.6em] h-[0.9em] w-auto shrink-0"
          />
        </span>
      ))}
    </div>
  )

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-surface py-3 text-2xl leading-none font-extrabold tracking-tight text-brand uppercase md:py-4 md:text-4xl",
        className
      )}
    >
      <div
        data-inview={inView}
        style={{ "--marquee-duration": `${speed}s` } as React.CSSProperties}
        className="komunal-marquee-track flex w-max animate-[komunal-marquee_var(--marquee-duration)_linear_infinite] items-center hover:[animation-play-state:paused] data-[inview=false]:[animation-play-state:paused]"
      >
        {copy(false)}
        {/* Second copy makes translateX(-50%) seamless; it is duplicate content. */}
        {copy(true)}
      </div>
    </div>
  )
}
