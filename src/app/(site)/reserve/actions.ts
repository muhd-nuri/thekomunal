"use server"
// Komunal: createReservation — validate, rate-limit, save with attribution, redirect; Telegram goes out after the response.
import { createHash } from "node:crypto"

import { and, count, eq, gte } from "drizzle-orm"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { db } from "@/db"
import { reservations, type Reservation } from "@/db/schema"
import { getOutlet } from "@/data/outlets"
import { bookingRules, reservationCopy } from "@/data/reservation"
import {
  FIRST_TOUCH_COOKIE,
  LAST_TOUCH_COOKIE,
  clickIdOf,
  decodeTouch,
  deriveChannel,
} from "@/lib/attribution"
import { generateBookingCode } from "@/lib/booking-code"
import { clientIpFrom } from "@/lib/client-ip"
import { checkBookingTime } from "@/lib/booking-time"
import { normaliseMyMobile } from "@/lib/phone"
import { notifyReservation } from "@/lib/reservation-notify"
import {
  HONEYPOT_FIELD,
  reservationFields,
  reservationSchema,
  type ReservationField,
} from "@/lib/validation/reservation"

export type ReservationActionState =
  | { status: "idle" }
  | {
      status: "error"
      message: string
      fieldErrors?: Partial<Record<ReservationField, string>>
      values?: Partial<Record<ReservationField, string>>
    }

let warnedAboutSalt = false

function hashIp(ip: string | null) {
  if (!ip) return null
  const salt = process.env.IP_HASH_SALT
  if (!salt && !warnedAboutSalt) {
    warnedAboutSalt = true
    console.error("[reserve] IP_HASH_SALT is not set; IP hashes are unsalted")
  }
  return createHash("sha256")
    .update(`${ip}${salt ?? ""}`)
    .digest("hex")
}

function pathOf(url: string | null) {
  if (!url) return null
  try {
    const u = new URL(url)
    return `${u.pathname}${u.search}`.slice(0, 300)
  } catch {
    return null
  }
}

function isUniqueCodeViolation(error: unknown) {
  const candidates = [error, (error as { cause?: unknown })?.cause]
  return candidates.some((e) => {
    const err = e as { code?: string; constraint_name?: string } | undefined
    return (
      err?.code === "23505" &&
      err.constraint_name === "reservations_code_unique"
    )
  })
}

export async function createReservation(
  _prev: ReservationActionState,
  formData: FormData
): Promise<ReservationActionState> {
  const values: Partial<Record<ReservationField, string>> = {}
  for (const field of reservationFields) {
    const v = formData.get(field)
    if (typeof v === "string") values[field] = v
  }

  // Bots fill the hidden field. Pretend it worked and save nothing.
  const honeypot = formData.get(HONEYPOT_FIELD)
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    redirect("/reserve/thank-you")
  }

  const parsed = reservationSchema.safeParse(values)
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ReservationField, string>> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ReservationField | undefined
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
      values,
    }
  }

  const data = parsed.data
  const outlet = getOutlet(data.outletSlug)
  const phoneE164 = normaliseMyMobile(data.phone)
  const slot = outlet
    ? checkBookingTime(data.date, data.time, outlet.opening)
    : null
  if (!outlet || !phoneE164 || !slot?.ok) {
    return { status: "error", message: reservationCopy.genericError, values }
  }

  const h = await headers()
  const c = await cookies()
  const ipHash = hashIp(clientIpFrom(h.get("x-forwarded-for")))

  let code: string
  try {
    if (ipHash) {
      const since = new Date(
        Date.now() - bookingRules.rateLimit.windowMinutes * 60_000
      )
      const [{ recent }] = await db
        .select({ recent: count() })
        .from(reservations)
        .where(
          and(
            eq(reservations.ipHash, ipHash),
            gte(reservations.createdAt, since)
          )
        )
      if (recent >= bookingRules.rateLimit.max) {
        return { status: "error", message: reservationCopy.rateLimited, values }
      }
    }

    const lastTouch = decodeTouch(c.get(LAST_TOUCH_COOKIE)?.value)
    const firstTouch = decodeTouch(c.get(FIRST_TOUCH_COOKIE)?.value)
    const { channel, detail } = deriveChannel(lastTouch)
    const click = clickIdOf(lastTouch)

    const row = {
      name: data.name,
      email: data.email,
      phoneRaw: data.phone,
      phoneE164,
      company: data.company ?? null,
      eventType: data.eventType,
      outletSlug: outlet.slug,
      guests: data.guests,
      reservedDate: data.date,
      reservedTime: data.time,
      reservedAt: slot.at,
      notes: data.notes ?? null,
      sourceChannel: channel,
      sourceDetail: detail ?? null,
      refCode: lastTouch?.ref ?? null,
      utmSource: lastTouch?.utm_source ?? null,
      utmMedium: lastTouch?.utm_medium ?? null,
      utmCampaign: lastTouch?.utm_campaign ?? null,
      utmContent: lastTouch?.utm_content ?? null,
      utmTerm: lastTouch?.utm_term ?? null,
      clickIdType: click?.type ?? null,
      clickId: click?.id ?? null,
      referrerUrl: lastTouch?.referrer ?? null,
      landingPath: lastTouch?.landing || null,
      submitPath: pathOf(h.get("referer")),
      firstTouch: firstTouch ?? null,
      userAgent: h.get("user-agent")?.slice(0, 500) ?? null,
      ipHash,
    }

    let inserted: Reservation | undefined
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      try {
        ;[inserted] = await db
          .insert(reservations)
          .values({ ...row, code: generateBookingCode() })
          .returning()
      } catch (error) {
        if (!isUniqueCodeViolation(error)) throw error
      }
    }
    if (!inserted) throw new Error("Could not allocate a booking code")
    code = inserted.code
    const saved = inserted

    // Notify the booking team after the guest has their confirmation page.
    after(async () => {
      await notifyReservation(saved)
    })
  } catch (error) {
    console.error("[reserve] could not save reservation", error)
    return { status: "error", message: reservationCopy.genericError, values }
  }

  redirect(`/reserve/thank-you?code=${code}`)
}
