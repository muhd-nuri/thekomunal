// Komunal: booking codes like KM-7F3K2 — no 0/O, 1/I/L, so they survive being read out over the phone.
import { randomInt } from "node:crypto"

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
const LENGTH = 5

export const BOOKING_CODE_RE = /^KM-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/

export function generateBookingCode() {
  let out = ""
  for (let i = 0; i < LENGTH; i++) out += ALPHABET[randomInt(ALPHABET.length)]
  return `KM-${out}`
}
