// Komunal: Tier B motion — one easing, small distances, reveal once. Never scale, never cascade everything.
import type { Variants } from "framer-motion"

export const easeOut = [0.16, 1, 0.3, 1] as const

export const reveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
}

/** Character peek-in: slides 24px out from behind a photo edge and un-tilts, once. */
export const peek: Variants = {
  hidden: { opacity: 0, x: 24, rotate: -3 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
}

/** Shared viewport settings for "once" reveals. */
export const viewportOnce = { once: true, amount: 0.3 } as const
