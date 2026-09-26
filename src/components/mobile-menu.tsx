"use client"
// Komunal: the mobile menu sheet — split out of the navbar and loaded on demand
// (base-ui Dialog is ~30 KB gzipped, and only phones that open the menu need it).
import Link from "next/link"
import { X } from "lucide-react"

import { nav, site } from "@/data/site"
import { Logo } from "@/components/brand/logo"
import { CTAButton } from "@/components/cta-button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"

export function MobileMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
              onClick={close}
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
                onClick={close}
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
  )
}
