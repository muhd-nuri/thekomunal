// Komunal: Malaysian mobile numbers — accept how people type them, store them the way wa.me wants them.

/** Mobile prefixes after the leading 0 (015 is VoIP and can't be relied on for WhatsApp). */
const MOBILE_PREFIXES = ["10", "11", "12", "13", "14", "16", "17", "18", "19"]

/**
 * Normalise "012-345 6789", "+60 12 345 6789", "60123456789" … to "60123456789".
 * Returns null when the input is not a Malaysian mobile number.
 */
export function normaliseMyMobile(input: string): string | null {
  const trimmed = input.trim()
  if (!/^\+?[\d\s\-().]+$/.test(trimmed)) return null

  let digits = trimmed.replace(/\D/g, "")
  if (digits.startsWith("60")) digits = digits.slice(2)
  else if (digits.startsWith("0")) digits = digits.slice(1)
  else return null

  const prefix = digits.slice(0, 2)
  if (!MOBILE_PREFIXES.includes(prefix)) return null

  // 011 numbers carry one extra digit.
  const expected = prefix === "11" ? 10 : 9
  if (digits.length !== expected) return null

  return `60${digits}`
}

export function isValidMyMobile(input: string) {
  return normaliseMyMobile(input) !== null
}

/** "60123456789" → "012-345 6789"; "601126685945" → "011-2668 5945". */
export function formatMyMobile(e164: string) {
  const local = `0${e164.replace(/^60/, "")}`
  const head = local.slice(0, 3)
  const rest = local.slice(3)
  const split = rest.length === 8 ? 4 : 3
  return `${head}-${rest.slice(0, split)} ${rest.slice(split)}`
}
