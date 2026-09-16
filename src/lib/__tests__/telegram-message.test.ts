import { expect, test } from "bun:test"

import { generateBookingCode, BOOKING_CODE_RE } from "@/lib/booking-code"
import { buildBookingMessage, escapeHtml } from "@/lib/telegram-message"

test("escapes HTML in user input", () => {
  expect(escapeHtml(`<b>Tom & "Jerry"</b>`)).toBe(
    `&lt;b&gt;Tom &amp; "Jerry"&lt;/b&gt;`
  )
})

test("builds the booking message", () => {
  const { text, reply_markup } = buildBookingMessage({
    code: "KM-7F3K2",
    outletName: "Komunal Bukit Rimau",
    when: "Sun, 20 Sep 2026 · 7:30 PM",
    guests: 6,
    eventLabel: "Birthday party",
    name: "Aina <Rahman>",
    phoneE164: "60123456789",
    email: "aina@email.com",
    company: null,
    notes: "Window seat & cake <please>",
    channel: "referral",
    channelDetail: "newagency",
    landingPath: "/?ref=newagency&x=<y>",
    whatsappUrl: "https://wa.me/60123456789?text=hi",
  })
  expect(text).toBe(
    [
      "🆕 <b>New reservation · KM-7F3K2</b>",
      "📍 Komunal Bukit Rimau",
      "🗓 Sun, 20 Sep 2026 · 7:30 PM",
      "👥 6 pax · 🎉 Birthday party",
      "👤 Aina &lt;Rahman&gt; · 012-345 6789",
      "✉️ aina@email.com",
      "📝 Window seat &amp; cake &lt;please&gt;",
      "──────────",
      "📈 Referral · newagency",
      "↳ landed on /?ref=newagency&amp;x=&lt;y&gt;",
    ].join("\n")
  )
  expect(reply_markup.inline_keyboard[0][0]).toEqual({
    text: "💬 WhatsApp Aina",
    url: "https://wa.me/60123456789?text=hi",
  })
})

test("booking codes use the unambiguous alphabet", () => {
  for (let i = 0; i < 500; i++)
    expect(generateBookingCode()).toMatch(BOOKING_CODE_RE)
})
