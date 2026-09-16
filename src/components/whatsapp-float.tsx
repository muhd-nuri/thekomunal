"use client"
// Komunal: WhatsApp float — the one place the brand allows a non-brand colour; never on /reserve.

import { usePathname } from "next/navigation"
import { WhatsAppIcon } from "@/components/brand/social-icons"

import { site } from "@/data/site"

export function WhatsAppFloat() {
  const pathname = usePathname()

  // The reserve flow has its own WhatsApp call to action — no floating duplicate.
  if (pathname === "/reserve" || pathname?.startsWith("/reserve/")) return null

  const href = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
    site.whatsappGreeting
  )}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-[calc(1rem_+_env(safe-area-inset-bottom))] z-50 flex size-14 items-center justify-center rounded-blob bg-whatsapp text-white transition-transform duration-300 ease-out-quint hover:-translate-y-0.5"
    >
      <WhatsAppIcon className="size-8" />
    </a>
  )
}
