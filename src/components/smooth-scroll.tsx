"use client"
// Komunal: Tier B — Lenis owns scroll (lerp 0.1, duration 1.2); disabled entirely under prefers-reduced-motion.
import "lenis/dist/lenis.css"
import Lenis from "lenis"
import { useEffect, useState, type ReactNode } from "react"

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setEnabled(!mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis({ lerp: 0.1, duration: 1.2 })
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // Same-page anchors (e.g. "Order delivery" → #outlets) go through Lenis so the
    // easing matches the rest of the page; the navbar is fixed, so offset for it.
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey
      )
        return
      const anchor = (
        event.target as Element | null
      )?.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor) return
      const id = decodeURIComponent(anchor.getAttribute("href")!.slice(1))
      const target = id ? document.getElementById(id) : null
      if (!target) return
      event.preventDefault()
      lenis.scrollTo(target, { offset: -72 })
      window.history.replaceState(null, "", `#${id}`)
    }
    document.addEventListener("click", onClick)

    return () => {
      document.removeEventListener("click", onClick)
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [enabled])

  return <>{children}</>
}
