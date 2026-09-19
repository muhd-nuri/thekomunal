// Komunal: the booking-team Telegram message — HTML parse mode, so every user-supplied string is escaped.
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
  /** The partner/link ref from `?ref=` (`reservations.ref_code`), if any. */
  refCode?: string | null
  /** "2026-09-20", as stored in `reserved_date` */
  date: string
  /** "20:00", as stored in `reserved_time` */
  time: string
  guests: number
  eventLabel?: string
  name: string
  phoneE164: string
  email: string
  notes?: string | null
  /** Prefilled staff → guest wa.me link */
  whatsappUrl: string
  /** Admin detail page; only https URLs are allowed on Telegram buttons. */
  adminUrl?: string | null
  /** Marks a message sent again from the admin. */
  resent?: boolean
}

/** "2026-09-20" → "2026-09-20 (Sunday)". Read as a calendar date in UTC so
 *  the weekday can never slip a day with the server's timezone. */
export function dateWithWeekday(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const day = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(day.getTime())) return date
  const weekday = day.toLocaleDateString("en-GB", {
    weekday: "long",
    timeZone: "UTC",
  })
  return `${date} (${weekday})`
}

/* The team's own layout, set 19 Sep 2026 — plain labelled lines they can read
   and copy at a glance. Occasion and Notes always print, with "-" when empty,
   so every message has the same shape.

   "Ref" is the `?ref=` code the guest arrived with (reservations.ref_code) —
   NOT the KM-XXXXX booking code (corrected 19 Sep 2026: it briefly showed the
   booking code). The team's layout has no line for the booking code; it still
   reaches the guest in the WhatsApp button's prefilled text, and it, the
   outlet, company and channel/landing-page lines are all on the booking behind
   "Open in admin". Print "-" when there is no ref, same as Occasion and Notes. */
export function buildBookingMessage(input: TelegramBookingInput) {
  const e = escapeHtml
  const lines = [
    `📍The Komunal Reservation${input.resent ? " (resent)" : ""}`,
    "",
    `Ref: ${input.refCode ? e(input.refCode) : "-"}`,
    "",
    `Name: ${e(input.name)}`,
    `Email: ${e(input.email)}`,
    `Phone: ${e(formatMyMobile(input.phoneE164))}`,
    `Date: ${e(dateWithWeekday(input.date))}`,
    `Time: ${e(input.time)}`,
    `Pax: ${input.guests}`,
    `Occasion: ${input.eventLabel ? e(input.eventLabel) : "-"}`,
    `Notes: ${input.notes?.trim() ? e(input.notes.trim()) : "-"}`,
  ]

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
