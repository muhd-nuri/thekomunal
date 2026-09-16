import { describe, expect, test } from "bun:test"

import { formatMyMobile, normaliseMyMobile } from "@/lib/phone"

describe("normaliseMyMobile", () => {
  test.each([
    ["012-345 6789", "60123456789"],
    ["0123456789", "60123456789"],
    ["+60 12 345 6789", "60123456789"],
    ["60123456789", "60123456789"],
    ["011-2668 5945", "601126685945"],
    ["+6011 2668 5945", "601126685945"],
    ["(016) 437-5378", "60164375378"],
  ])("%s → %s", (input, expected) => {
    expect(normaliseMyMobile(input)).toBe(expected)
  })

  test.each([
    "",
    "03-1234 5678", // landline
    "015-4567 8901", // VoIP
    "012-345 678", // too short
    "011-2668 594", // 011 needs 8 digits after the prefix
    "0123456789012",
    "+65 9123 4567", // Singapore
    "12-345 6789", // no leading 0 or 60
    "012-345 6789 ext 2",
  ])("rejects %p", (input) => {
    expect(normaliseMyMobile(input)).toBeNull()
  })
})

test("formatMyMobile", () => {
  expect(formatMyMobile("60123456789")).toBe("012-345 6789")
  expect(formatMyMobile("601126685945")).toBe("011-2668 5945")
})
