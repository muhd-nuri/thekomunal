"use client"
// Komunal: navbar — oversized logotype + one button; inverts on blue bands, hides on scroll down.

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useReducedMotion } from "framer-motion"
import { Menu, X } from "lucide-react"

import { nav, site } from "@/data/site"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"
import { CTAButton } from "@/components/cta-button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"

type Band = "cream" | "white" | "brand"

/** Fallback bar height used before the bar has measured itself (72px desktop / 64px mobile). */
const FALLBACK_BAR_HEIGHT = 72

/** useLayoutEffect on the client, useEffect on the server (avoids the SSR warning). */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

function toBand(value: string | undefined): Band | null {
  return value === "brand" || value === "white" || value === "cream"
    ? value
    : null
}

export function Navbar() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const barRef = useRef<HTMLDivElement>(null)
  const [band, setBand] = useState<Band>("cream")
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)

  const onBrand = band === "brand"

  // ---------------------------------------------------------------------------
  // Band inversion: an IntersectionObserver whose root is squeezed down to a 1px
  // line sitting exactly at the navbar's bottom edge. Whichever [data-band]
  // section crosses that line owns the bar's colours.
  // ---------------------------------------------------------------------------
  useIsomorphicLayoutEffect(() => {
    let observer: IntersectionObserver | null = null
    let frame = 0
    let observedCount = -1

    const barHeight = () => barRef.current?.offsetHeight ?? FALLBACK_BAR_HEIGHT

    const pick = () => {
      const line = barHeight()
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-band]")
      )
      let next: Band | null = null
      for (const el of sections) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= line && rect.bottom > line) {
          next = toBand(el.dataset.band) ?? next
        }
      }
      setBand(next ?? "cream")
    }

    const attach = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-band]")
      )
      observer?.disconnect()
      const line = barHeight()
      const bottom = Math.max(0, window.innerHeight - line - 1)
      observer = new IntersectionObserver(pick, {
        rootMargin: `-${line}px 0px -${bottom}px 0px`,
        threshold: 0,
      })
      for (const el of sections) observer.observe(el)
      observedCount = sections.length
      pick()
    }

    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(attach)
    }

    // Re-query after navigation / late-mounting sections.
    schedule()

    const mutations = new MutationObserver(() => {
      const count = document.querySelectorAll("[data-band]").length
      if (count !== observedCount) schedule()
    })
    mutations.observe(document.body, { childList: true, subtree: true })
    window.addEventListener("resize", schedule)

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      mutations.disconnect()
      window.removeEventListener("resize", schedule)
    }
  }, [pathname])

  // ---------------------------------------------------------------------------
  // Hide on scroll down, show on scroll up. Lenis still emits native scroll
  // events, so a passive window listener is enough.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let lastY = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < 4) return
      lastY = y
      if (y <= 80) setHidden(false)
      else setHidden(delta > 0)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // A route change should never leave the bar parked off-screen or the sheet
  // open — reset during render (React's "adjust state on prop change" pattern).
  const [seenPath, setSeenPath] = useState(pathname)
  if (seenPath !== pathname) {
    setSeenPath(pathname)
    setHidden(false)
    setOpen(false)
  }

  // Always visible while the mobile sheet is open, and never slide away under
  // reduced motion (a zeroed transition would jump rather than slide).
  const translated = hidden && !open && !reduceMotion

  const closeSheet = () => setOpen(false)

  return (
    <>
      <a
        href="#main"
        className="sr-only top-4 left-4 z-50 rounded-field bg-brand px-4 py-3 text-sm font-extrabold text-white focus:not-sr-only focus:fixed"
      >
        Skip to content
      </a>

      <header
        ref={barRef}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out-quint",
          onBrand ? "bg-brand/90 text-white" : "bg-cream/90 text-ink",
          "supports-backdrop-filter:backdrop-blur",
          translated && "-translate-y-full"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-gutter md:h-[72px]">
          <Link
            href="/"
            aria-label={site.name}
            className="flex shrink-0 items-center"
          >
            <Logo
              variant="logotype"
              className="h-9 w-auto text-current md:h-11"
              title={site.name}
            />
          </Link>

          {/* Desktop */}
          <nav
            aria-label="Main"
            className="hidden items-center gap-8 md:flex lg:gap-10"
          >
            {nav.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-extrabold tracking-[0.08em] uppercase underline-offset-8 hover:underline"
              >
                {link.label}
              </Link>
            ))}
            <CTAButton
              href={nav.cta.href}
              variant={onBrand ? "on-brand" : "primary"}
              className="h-11"
            >
              {nav.cta.label}
            </CTAButton>
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <CTAButton
              href={nav.cta.href}
              variant={onBrand ? "on-brand" : "primary"}
              className="h-11 px-5"
            >
              {nav.cta.label}
            </CTAButton>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-blob text-current"
            >
              <Menu className="size-6" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="top"
          showCloseButton={false}
          data-lenis-prevent
          className="gap-0 bg-brand text-white shadow-none data-[side=top]:border-b-0"
        >
          <SheetTitle className="sr-only">{site.name} menu</SheetTitle>

          {/* The inner panel repaints the brand band itself, so the sheet stays
              full-bleed blue even if the popup's own class merge ever loses. */}
          <div className="flex min-h-svh w-full flex-col bg-brand px-gutter pt-0 pb-10 text-white">
            <div className="flex h-16 shrink-0 items-center justify-between">
              <Link
                href="/"
                aria-label={site.name}
                onClick={closeSheet}
                className="flex items-center"
              >
                <Logo
                  variant="logotype"
                  tone="white"
                  className="h-9 w-auto text-current"
                  title={site.name}
                />
              </Link>
              <SheetClose
                aria-label="Close menu"
                className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-blob text-white"
              >
                <X className="size-7" strokeWidth={2.5} aria-hidden />
              </SheetClose>
            </div>

            <nav
              aria-label="Mobile"
              className="flex flex-1 flex-col justify-center gap-2 py-10"
            >
              {nav.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeSheet}
                  className="block text-[clamp(2.5rem,12vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.02em]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-6">
              <CTAButton
                href={nav.cta.href}
                variant="on-brand"
                className="w-full"
              >
                {nav.cta.label}
              </CTAButton>
              <div className="flex flex-col gap-2 text-base font-medium">
                <a
                  href={site.phone.href}
                  className="w-fit underline-offset-4 hover:underline"
                >
                  {site.phone.display}
                </a>
                <a
                  href={`https://wa.me/${site.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit underline-offset-4 hover:underline"
                >
                  WhatsApp us
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
