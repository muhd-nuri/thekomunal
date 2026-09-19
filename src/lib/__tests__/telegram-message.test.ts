import { expect, test } from "bun:test"

import { generateBookingCode, BOOKING_CODE_RE } from "@/lib/booking-code"
import {
  buildBookingMessage,
  dateWithWeekday,
  escapeHtml,
} from "@/lib/telegram-message"

test("escapes HTML in user input", () => {
  expect(escapeHtml(`<b>Tom & "Jerry"</b>`)).toBe(
    `&lt;b&gt;Tom &amp; "Jerry"&lt;/b&gt;`
  )
})

test("builds the booking message in the team's layout", () => {
  const { text, reply_markup } = buildBookingMessage({
    refCode: "ig-bio",
    date: "2026-09-20",
    time: "19:30",
    guests: 6,
    eventLabel: "Birthday party",
    name: "Aina <Rahman>",
    phoneE164: "60123456789",
    email: "aina@email.com",
    notes: "Window seat & cake <please>",
    whatsappUrl: "https://wa.me/60123456789?text=hi",
  })
  expect(text).toBe(
    [
      "📍The Komunal Reservation",
      "",
      "Ref: ig-bio",
      "",
      "Name: Aina &lt;Rahman&gt;",
      "Email: aina@email.com",
      "Phone: 012-345 6789",
      "Date: 2026-09-20 (Sunday)",
      "Time: 19:30",
      "Pax: 6",
      "Occasion: Birthday party",
      "Notes: Window seat &amp; cake &lt;please&gt;",
    ].join("\n")
  )
  expect(reply_markup.inline_keyboard[0][0]).toEqual({
    text: "💬 WhatsApp Aina",
    url: "https://wa.me/60123456789?text=hi",
  })
})

test("prints a dash for a missing ref, occasion or blank notes", () => {
  const { text } = buildBookingMessage({
    date: "2026-09-20",
    time: "12:00",
    guests: 2,
    name: "Aina",
    phoneE164: "60123456789",
    email: "aina@email.com",
    notes: "   ",
    whatsappUrl: "https://wa.me/60123456789",
  })
  expect(text).toContain("Ref: -")
  expect(text).not.toContain("KM-")
  expect(text).toContain("Occasion: -")
  expect(text.endsWith("Notes: -")).toBe(true)
})

test("names the weekday from the calendar date, not the server clock", () => {
  expect(dateWithWeekday("2026-09-20")).toBe("2026-09-20 (Sunday)")
  expect(dateWithWeekday("2026-12-31")).toBe("2026-12-31 (Thursday)")
  expect(dateWithWeekday("not-a-date")).toBe("not-a-date")
})

test("adds the admin button only for https URLs, and marks resends", () => {
  const base = {
    date: "2026-09-20",
    time: "19:30",
    guests: 2,
    name: "Aina",
    phoneE164: "60123456789",
    email: "aina@email.com",
    whatsappUrl: "https://wa.me/60123456789",
  }
  const withAdmin = buildBookingMessage({
    ...base,
    adminUrl: "https://thekomunal.com/admin/reservations/abc",
    resent: true,
  })
  expect(withAdmin.reply_markup.inline_keyboard[0][1]).toEqual({
    text: "🗂 Open in admin",
    url: "https://thekomunal.com/admin/reservations/abc",
  })
  expect(
    withAdmin.text.startsWith("📍The Komunal Reservation (resent)\n")
  ).toBe(true)
  const local = buildBookingMessage({
    ...base,
    adminUrl: "http://localhost:3000/admin/reservations/abc",
  })
  expect(local.reply_markup.inline_keyboard[0]).toHaveLength(1)
})

test("booking codes use the unambiguous alphabet", () => {
  for (let i = 0; i < 500; i++)
    expect(generateBookingCode()).toMatch(BOOKING_CODE_RE)
})
