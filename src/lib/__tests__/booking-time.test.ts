import { describe, expect, test } from "bun:test"

import {
  availableSlots,
  checkBookingTime,
  firstBookableDate,
  formatSlotLong,
  formatSlotShort,
  klDateTime,
  klToday,
  slotTimes,
} from "@/lib/booking-time"

const opening = { opens: "08:30", closes: "22:00" }
// 2026-09-20 10:00 in Kuala Lumpur is 02:00 UTC.
const now = new Date("2026-09-20T02:00:00Z")

test("slots run from opening to an hour before close", () => {
  const slots = slotTimes(opening)
  expect(slots[0]).toBe("08:30")
  expect(slots.at(-1)).toBe("21:00")
  expect(slots).toHaveLength(26)
})

test("KL wall time converts to the right instant", () => {
  expect(klDateTime("2026-09-20", "19:30")?.toISOString()).toBe(
    "2026-09-20T11:30:00.000Z"
  )
  expect(klDateTime("2026-02-31", "10:00")).toBeNull()
  expect(klDateTime("2026-9-2", "10:00")).toBeNull()
  expect(klDateTime("2026-09-20", "24:00")).toBeNull()
})

test("today follows KL, not UTC", () => {
  // 17:00 UTC on the 19th is already 01:00 on the 20th in KL.
  expect(klToday(new Date("2026-09-19T17:00:00Z"))).toBe("2026-09-20")
})

describe("checkBookingTime", () => {
  test("3 hours ahead is fine", () => {
    const r = checkBookingTime("2026-09-20", "13:00", opening, now)
    expect(r.ok).toBe(true)
  })
  test("2 hours ahead is too soon", () => {
    expect(checkBookingTime("2026-09-20", "12:00", opening, now)).toEqual({
      ok: false,
      error: "too_soon",
    })
  })
  test("past times are rejected", () => {
    expect(checkBookingTime("2026-09-20", "09:00", opening, now)).toEqual({
      ok: false,
      error: "past",
    })
  })
  test("off-grid and after-last-slot times are rejected", () => {
    expect(checkBookingTime("2026-09-21", "13:15", opening, now)).toEqual({
      ok: false,
      error: "outside_hours",
    })
    expect(checkBookingTime("2026-09-21", "21:30", opening, now)).toEqual({
      ok: false,
      error: "outside_hours",
    })
  })
  test("more than 60 days ahead is rejected", () => {
    expect(checkBookingTime("2026-11-20", "13:00", opening, now)).toEqual({
      ok: false,
      error: "too_far",
    })
    expect(checkBookingTime("2026-11-19", "13:00", opening, now).ok).toBe(true)
  })
})

test("available slots respect the lead time", () => {
  expect(availableSlots("2026-09-20", opening, now)[0]).toBe("13:00")
  expect(availableSlots("2026-09-21", opening, now)[0]).toBe("08:30")
})

test("late evening rolls the first bookable date to tomorrow", () => {
  // 20:00 KL: the last slot (21:00) is under 3 hours away.
  expect(firstBookableDate(opening, new Date("2026-09-20T12:00:00Z"))).toBe(
    "2026-09-21"
  )
  expect(firstBookableDate(opening, now)).toBe("2026-09-20")
})

test("formatting is in KL time", () => {
  const at = klDateTime("2026-09-20", "19:30")!
  expect(formatSlotLong(at)).toBe("Sun, 20 Sep 2026 · 7:30 PM")
  expect(formatSlotShort(at)).toBe("Sun, 20 Sep at 7:30 PM")
})
