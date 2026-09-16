"use server"
// Komunal: reservation actions — status changes and resending to Telegram.
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { reservations } from "@/db/schema"
import { assertAdmin } from "@/lib/admin/guard"
import {
  statusLabels,
  statusValues,
  type ReservationStatus,
} from "@/lib/admin/reservation-labels"
import { getReservation } from "@/lib/admin/reservations"
import { notifyReservation } from "@/lib/reservation-notify"

export type ActionResult =
  { ok: true; message: string } | { ok: false; error: string }

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<ActionResult> {
  await assertAdmin()
  if (!statusValues.includes(status))
    return { ok: false, error: "Unknown status." }
  const row = await getReservation(id)
  if (!row) return { ok: false, error: "That reservation no longer exists." }

  await db
    .update(reservations)
    .set({
      status,
      // First time anyone moved it past "new" is when the guest was contacted.
      contactedAt: row.contactedAt ?? (status !== "new" ? new Date() : null),
    })
    .where(eq(reservations.id, id))

  revalidatePath("/admin", "layout")
  return {
    ok: true,
    message: `${row.code} marked ${statusLabels[status].toLowerCase()}.`,
  }
}

export async function resendToTelegram(id: string): Promise<ActionResult> {
  await assertAdmin()
  const row = await getReservation(id)
  if (!row) return { ok: false, error: "That reservation no longer exists." }
  const result = await notifyReservation(row, { resent: true })
  revalidatePath("/admin", "layout")
  return result.ok
    ? { ok: true, message: `${row.code} sent to Telegram.` }
    : { ok: false, error: `Telegram didn't accept it: ${result.error}` }
}
