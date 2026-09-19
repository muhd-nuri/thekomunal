// Komunal: sends a saved reservation to the booking team's Telegram group and records
// the outcome on the row. Used after a guest books, and by "Resend" in the admin.
import "server-only"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { reservations, type Reservation } from "@/db/schema"
import { getOutlet, primaryOutlet } from "@/data/outlets"
import { eventTypeLabel, staffWhatsAppMessage } from "@/data/reservation"
import { formatSlotShort } from "@/lib/booking-time"
import { sendTelegramMessage } from "@/lib/telegram"
import { buildBookingMessage, firstNameOf } from "@/lib/telegram-message"

export function whatsappUrlFor(row: Reservation) {
  const outlet = getOutlet(row.outletSlug) ?? primaryOutlet
  const text = staffWhatsAppMessage({
    firstName: firstNameOf(row.name),
    outletName: outlet.shortName,
    code: row.code,
    guests: row.guests,
    when: formatSlotShort(row.reservedAt),
  })
  return `https://wa.me/${row.phoneE164}?text=${encodeURIComponent(text)}`
}

export async function notifyReservation(
  row: Reservation,
  options: { resent?: boolean } = {}
) {
  const outlet = getOutlet(row.outletSlug) ?? primaryOutlet
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? ""
  const message = buildBookingMessage({
    refCode: row.refCode,
    date: row.reservedDate,
    time: row.reservedTime,
    guests: row.guests,
    eventLabel: row.eventType ? eventTypeLabel(row.eventType) : undefined,
    name: row.name,
    phoneE164: row.phoneE164,
    email: row.email,
    notes: row.notes,
    whatsappUrl: whatsappUrlFor(row),
    adminUrl: site
      ? `${site.replace(/\/$/, "")}/admin/reservations/${row.id}`
      : null,
    resent: options.resent,
  })
  const result = await sendTelegramMessage({
    ...message,
    threadId: outlet.telegramThreadId,
  })
  try {
    await db
      .update(reservations)
      .set(
        result.ok
          ? {
              telegramStatus: "sent",
              telegramMessageId: result.messageId,
              telegramError: null,
            }
          : { telegramStatus: "failed", telegramError: result.error }
      )
      .where(eq(reservations.id, row.id))
  } catch (error) {
    console.error(`[telegram] could not record status for ${row.code}`, error)
  }
  if (!result.ok)
    console.error(`[telegram] failed for ${row.code}: ${result.error}`)
  return result
}
