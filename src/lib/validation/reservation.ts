// Komunal: one reservation schema for the form and the server action — the server result is the one that counts.
import { z } from "zod"

import { getOutlet, reservableOutlets } from "@/data/outlets"
import { eventTypeValues } from "@/data/reservation"
import { bookingTimeMessages, checkBookingTime } from "@/lib/booking-time"
import { isValidMyMobile } from "@/lib/phone"

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, { error: message })
    .optional()
    .transform((v) => (v ? v : undefined))

/** `now` is injectable so tests (and the server) can pin the clock. */
export function makeReservationSchema(now: () => Date = () => new Date()) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(2, { error: "Please enter your name." })
        .max(80, { error: "Please keep your name under 80 characters." }),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .max(254, { error: "That email looks too long." })
        .pipe(z.email({ error: "Please enter a valid email address." })),
      phone: z.string().trim().refine(isValidMyMobile, {
        error: "Please enter a Malaysian mobile number, e.g. 012-345 6789.",
      }),
      company: optionalText(120, "Please keep this under 120 characters."),
      eventType: z.enum(eventTypeValues, {
        error: "Please choose what the booking is for.",
      }),
      outletSlug: z
        .string()
        .refine((slug) => reservableOutlets.some((o) => o.slug === slug), {
          error: "Please choose an outlet.",
        }),
      guests: z.coerce
        .number({ error: "Please enter the number of guests." })
        .int({ error: "Please enter a whole number." })
        .min(1, { error: "At least 1 guest, please." }),
      date: z.string().min(1, { error: "Please choose a date." }),
      time: z.string().min(1, { error: "Please choose a time." }),
      notes: optionalText(1000, "Please keep notes under 1,000 characters."),
    })
    .superRefine((value, ctx) => {
      const outlet = getOutlet(value.outletSlug)
      if (!outlet) return

      if (value.guests > outlet.maxGuestsOnline) {
        ctx.addIssue({
          code: "custom",
          path: ["guests"],
          message: `We take up to ${outlet.maxGuestsOnline} guests online. For bigger groups, WhatsApp us.`,
        })
      }

      if (value.date && value.time) {
        const result = checkBookingTime(
          value.date,
          value.time,
          outlet.opening,
          now()
        )
        if (!result.ok) {
          ctx.addIssue({
            code: "custom",
            path: [result.error === "too_far" ? "date" : "time"],
            message: bookingTimeMessages[result.error],
          })
        }
      }
    })
}

export const reservationSchema = makeReservationSchema()

export type ReservationInput = z.input<typeof reservationSchema>
export type ReservationData = z.output<typeof reservationSchema>

export const reservationFields = [
  "name",
  "email",
  "phone",
  "company",
  "eventType",
  "outletSlug",
  "guests",
  "date",
  "time",
  "notes",
] as const

export type ReservationField = (typeof reservationFields)[number]

/** The honeypot field name. Real people never see or fill it. */
export const HONEYPOT_FIELD = "website"
