import { expect, test } from "bun:test"

import { makeReservationSchema } from "@/lib/validation/reservation"

const now = new Date("2026-09-20T02:00:00Z") // 10:00 KL
const schema = makeReservationSchema(() => now)

const valid = {
  name: "  Aina Rahman ",
  email: " Aina@Email.com ",
  phone: "012-345 6789",
  company: "",
  eventType: "birthday-party",
  outletSlug: "bukit-rimau",
  guests: "6",
  date: "2026-09-20",
  time: "19:30",
  notes: "",
}

function errorsFor(input: Record<string, string>) {
  const r = schema.safeParse(input)
  if (r.success) return {}
  return Object.fromEntries(
    r.error.issues.map((i) => [String(i.path[0]), i.message])
  )
}

test("a valid booking parses and cleans up", () => {
  const r = schema.safeParse(valid)
  expect(r.success).toBe(true)
  if (!r.success) return
  expect(r.data).toMatchObject({
    name: "Aina Rahman",
    email: "aina@email.com",
    guests: 6,
    company: undefined,
    notes: undefined,
  })
})

test("a booking 2 hours ahead is rejected with a clear message", () => {
  expect(errorsFor({ ...valid, time: "12:00" }).time).toContain(
    "at least 3 hours ahead"
  )
})

test("guests above the outlet cap point to WhatsApp", () => {
  expect(errorsFor({ ...valid, guests: "61" }).guests).toContain("up to 60")
  expect(errorsFor({ ...valid, guests: "60" }).guests).toBeUndefined()
  expect(errorsFor({ ...valid, guests: "0" }).guests).toBeDefined()
  expect(errorsFor({ ...valid, guests: "2.5" }).guests).toBeDefined()
})

test("unknown outlet, event type and bad contact details are rejected", () => {
  const errors = errorsFor({
    ...valid,
    outletSlug: "bukit-jelutong",
    eventType: "wedding",
    email: "nope",
    phone: "03-1234 5678",
    name: "A",
  })
  expect(Object.keys(errors).sort()).toEqual([
    "email",
    "eventType",
    "name",
    "outletSlug",
    "phone",
  ])
})

test("length limits", () => {
  expect(errorsFor({ ...valid, notes: "x".repeat(1001) }).notes).toBeDefined()
  expect(
    errorsFor({ ...valid, company: "x".repeat(121) }).company
  ).toBeDefined()
})
