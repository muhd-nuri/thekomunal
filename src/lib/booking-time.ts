// Komunal: booking time rules — every calculation happens in Kuala Lumpur wall time, whatever the server clock says.
import { TZDate } from "@date-fns/tz"
import { addDays, addMinutes, format } from "date-fns"

import { bookingRules } from "@/data/reservation"

const TZ = bookingRules.timeZone

export type Opening = { opens: string; closes: string }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

function fromMinutes(total: number) {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/** All bookable slot times for an outlet, e.g. ["08:30", "09:00", … "21:00"]. */
export function slotTimes(opening: Opening) {
  const first = toMinutes(opening.opens)
  const last =
    toMinutes(opening.closes) - bookingRules.lastSlotBeforeCloseMinutes
  const out: string[] = []
  for (let t = first; t <= last; t += bookingRules.slotMinutes)
    out.push(fromMinutes(t))
  return out
}

/** "2026-09-20" + "19:30" in KL → the absolute instant. Null if either part is malformed. */
export function klDateTime(date: string, time: string): Date | null {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) return null
  const [y, mo, d] = date.split("-").map(Number)
  const [h, mi] = time.split(":").map(Number)
  const value = new TZDate(y, mo - 1, d, h, mi, TZ)
  // Reject rollovers such as 2026-02-31.
  if (
    value.getFullYear() !== y ||
    value.getMonth() !== mo - 1 ||
    value.getDate() !== d
  ) {
    return null
  }
  return new Date(value.getTime())
}

/** Today's date in KL as "YYYY-MM-DD". */
export function klToday(now: Date = new Date()) {
  return format(new TZDate(now, TZ), "yyyy-MM-dd")
}

export function klDateOffset(days: number, now: Date = new Date()) {
  return format(addDays(new TZDate(now, TZ), days), "yyyy-MM-dd")
}

/** The earliest instant a booking may start. */
export function earliestBookable(now: Date = new Date()) {
  return addMinutes(now, bookingRules.minLeadHours * 60)
}

/** Slots for a date that are still bookable given the lead time. */
export function availableSlots(
  date: string,
  opening: Opening,
  now: Date = new Date()
) {
  const earliest = earliestBookable(now).getTime()
  return slotTimes(opening).filter((time) => {
    const at = klDateTime(date, time)
    return at !== null && at.getTime() >= earliest
  })
}

/** First date (KL) that still has a bookable slot. */
export function firstBookableDate(opening: Opening, now: Date = new Date()) {
  for (let i = 0; i <= bookingRules.maxDaysAhead; i++) {
    const date = klDateOffset(i, now)
    if (availableSlots(date, opening, now).length > 0) return date
  }
  return klDateOffset(1, now)
}

export type BookingTimeError =
  "invalid" | "past" | "too_soon" | "too_far" | "outside_hours"

export const bookingTimeMessages: Record<BookingTimeError, string> = {
  invalid: "Please choose a valid date and time.",
  past: "That time has already passed. Please pick another.",
  too_soon:
    "Please book at least 3 hours ahead. For sooner tables, WhatsApp us.",
  too_far: `We take bookings up to ${bookingRules.maxDaysAhead} days ahead.`,
  outside_hours: "Please pick one of the available times.",
}

/** Validate a KL date + time against the outlet rules. Returns the instant or an error code. */
export function checkBookingTime(
  date: string,
  time: string,
  opening: Opening,
  now: Date = new Date()
): { ok: true; at: Date } | { ok: false; error: BookingTimeError } {
  const at = klDateTime(date, time)
  if (!at) return { ok: false, error: "invalid" }
  if (!slotTimes(opening).includes(time))
    return { ok: false, error: "outside_hours" }
  if (at.getTime() < now.getTime()) return { ok: false, error: "past" }
  if (at.getTime() < earliestBookable(now).getTime())
    return { ok: false, error: "too_soon" }
  if (date > klDateOffset(bookingRules.maxDaysAhead, now))
    return { ok: false, error: "too_far" }
  return { ok: true, at }
}

/** "Sat, 20 Sep 2026 · 7:30 PM" */
export function formatSlotLong(at: Date) {
  return format(new TZDate(at, TZ), "EEE, d MMM yyyy · h:mm a")
}

/** "Sat, 20 Sep at 7:30 PM" */
export function formatSlotShort(at: Date) {
  return format(new TZDate(at, TZ), "EEE, d MMM 'at' h:mm a")
}

/** "19:30" → "7:30 PM" */
export function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number)
  const suffix = h >= 12 ? "PM" : "AM"
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`
}
