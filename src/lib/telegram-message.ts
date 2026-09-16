// Komunal: the booking-team Telegram message — HTML parse mode, so every user-supplied string is escaped.
import { channelLabels, type SourceChannel } from "@/lib/attribution"
import { formatMyMobile } from "@/lib/phone"

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] ?? name
}

export type TelegramBookingInput = {
  code: string
  outletName: string
  /** "Sat, 20 Sep 2026 · 7:30 PM" */
  when: string
  guests: number
  eventLabel?: string
  name: string
  phoneE164: string
  email: string
  company?: string | null
  notes?: string | null
  channel: SourceChannel
  channelDetail?: string | null
  landingPath?: string | null
  /** Prefilled staff → guest wa.me link */
  whatsappUrl: string
  /** Admin detail page; only https URLs are allowed on Telegram buttons. */
  adminUrl?: string | null
  /** Marks a message sent again from the admin. */
  resent?: boolean
}

export function buildBookingMessage(input: TelegramBookingInput) {
  const e = escapeHtml
  const lines = [
    `${input.resent ? "🔁" : "🆕"} <b>${input.resent ? "Reservation (resent)" : "New reservation"} · ${e(input.code)}</b>`,
    `📍 ${e(input.outletName)}`,
    `🗓 ${e(input.when)}`,
    `👥 ${input.guests} pax${input.eventLabel ? ` · 🎉 ${e(input.eventLabel)}` : ""}`,
    `👤 ${e(input.name)} · ${e(formatMyMobile(input.phoneE164))}`,
    `✉️ ${e(input.email)}`,
  ]
  if (input.company) lines.push(`🏢 ${e(input.company)}`)
  if (input.notes) lines.push(`📝 ${e(input.notes)}`)
  lines.push("──────────")
  lines.push(
    `📈 ${e(channelLabels[input.channel])}${input.channelDetail ? ` · ${e(input.channelDetail)}` : ""}`
  )
  if (input.landingPath) lines.push(`↳ landed on ${e(input.landingPath)}`)

  const buttonName = firstNameOf(input.name).slice(0, 24)
  const buttons = [
    { text: `💬 WhatsApp ${buttonName}`, url: input.whatsappUrl },
  ]
  if (input.adminUrl?.startsWith("https://")) {
    buttons.push({ text: "🗂 Open in admin", url: input.adminUrl })
  }
  return {
    text: lines.join("\n"),
    reply_markup: { inline_keyboard: [buttons] },
  }
}
