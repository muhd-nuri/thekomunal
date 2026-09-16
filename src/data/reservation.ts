// Komunal: reservation rules and copy — the form, server action and Telegram message all read from here.

export const eventTypes = [
  { value: "corporate-team-celebration", label: "Corporate team celebration" },
  { value: "birthday-party", label: "Birthday party" },
  { value: "family-gathering", label: "Family gathering" },
  { value: "business-meeting", label: "Business meeting" },
  { value: "others", label: "Others" },
] as const

export type EventTypeValue = (typeof eventTypes)[number]["value"]

export const eventTypeValues = eventTypes.map((e) => e.value) as [
  EventTypeValue,
  ...EventTypeValue[],
]

export function eventTypeLabel(value: string | null | undefined) {
  return eventTypes.find((e) => e.value === value)?.label ?? value ?? ""
}

/** Booking rules. Every time here is Asia/Kuala_Lumpur wall time. */
export const bookingRules = {
  timeZone: "Asia/Kuala_Lumpur",
  /** Minimum notice before the table time. */
  minLeadHours: 3,
  /** Slot length, in minutes. */
  slotMinutes: 30,
  /** Last slot sits this many minutes before closing. Assumption — confirm with the client. */
  lastSlotBeforeCloseMinutes: 60,
  /** How far ahead the form accepts bookings. */
  maxDaysAhead: 60,
  /** Rate limit: submissions per hashed IP within the window. */
  rateLimit: { max: 5, windowMinutes: 10 },
} as const

export const reservationCopy = {
  eyebrow: "Reservations",
  heading: "Book your table",
  intro:
    "Tell us when you're coming and how many of you there are. Planning a birthday, a team lunch or a family get-together? Add the details and we'll set it up.",
  leadTime: "Please book at least 3 hours ahead.",
  requestNote:
    "This is a booking request. Your table is confirmed once our team WhatsApps you.",
  largeGroup: (max: number) =>
    `Coming with more than ${max}? WhatsApp us and we'll plan it with you.`,
  submit: "Send booking request",
  submitting: "Sending…",
  genericError:
    "Something went wrong while sending your request. Please try again, or WhatsApp us.",
  rateLimited:
    "You've sent a few requests in a short time. Please wait a few minutes, or WhatsApp us.",
  privacy:
    "We use your details only to handle this booking and contact you about it.",
  thankYou: {
    eyebrow: "Request received",
    heading: "See you soon!",
    body: "We'll WhatsApp you shortly to confirm your table.",
    codeLabel: "Your booking code",
    codeHint: "Quote this code if you contact us about this booking.",
    fallbackBody:
      "Your request is with our team. We'll WhatsApp you shortly to confirm your table.",
    guests: (n: number) => (n === 1 ? "1 guest" : `${n} guests`),
    summaryLabel: "Your request",
    home: "Back to home",
    menu: "See the menu",
  },
  // Page
  metaDescription:
    "Book a table at The Komunal Bukit Rimau, Shah Alam. Send a request and our team will WhatsApp you to confirm.",
  headingEmphasis: "table",
  outletLabel: "Where you're booking",
  largeGroupWhatsAppText: (outletName: string) =>
    `Hi Komunal! I'd like to book ${outletName} for a big group. Date: — Time: — Guests: —`,
  noSlotsWhatsAppText: (outletName: string) =>
    `Hi Komunal! I'd like a table at ${outletName} soon. Date: — Time: — Guests: —`,
  whatsappUs: "WhatsApp us",
  // Form
  formHeading: "Your booking",
  requiredNote: "Fields marked * are required.",
  fields: {
    name: { label: "Name", placeholder: "Your full name" },
    phone: {
      label: "Phone",
      hint: "We'll WhatsApp you on this number",
      placeholder: "012-345 6789",
    },
    email: { label: "Email", placeholder: "you@example.com" },
    company: { label: "Company", optional: "optional" },
    eventType: { label: "What's the occasion?" },
    outlet: {
      label: "Outlet",
      bookingAt: (name: string) => `Booking at ${name}`,
    },
    guests: {
      label: "Guests",
      decrease: "Remove a guest",
      increase: "Add a guest",
    },
    date: { label: "Date", placeholder: "Choose a date" },
    time: {
      label: "Time",
      groups: {
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening",
      },
      pickDate: "Pick a date to see the available times.",
      noSlots:
        "No times left on this date. Try the next day, or WhatsApp us for a sooner table.",
      tryNextDay: "Try the next day",
    },
    notes: {
      label: "Anything we should know?",
      optional: "optional",
      placeholder: "Birthday cake, high chair, projector…",
    },
    honeypot: { label: "Leave this field empty" },
  },
  privacyLink: "Privacy notice",
  /** Shown instead of a schema's built-in wording (e.g. a radio group left empty without JS). */
  fieldFallback: "Please check this field.",
  missingField: {
    eventType: "Please choose what the booking is for.",
    date: "Please choose a date.",
    time: "Please choose a time.",
    guests: "Please enter the number of guests.",
  } as Partial<Record<string, string>>,
} as const

/**
 * Staff → guest WhatsApp opener, sent from the Telegram button.
 * Written by Claude at the client's request (2026-09-16). It asks rather than
 * confirms, because a booking is only a request until staff reply.
 */
export function staffWhatsAppMessage(input: {
  firstName: string
  outletName: string
  code: string
  guests: number
  /** e.g. "Sat, 20 Sep at 7:30 PM" */
  when: string
}) {
  return `Hi ${input.firstName}! This is ${input.outletName} 👋 We got your table request (${input.code}) for ${input.guests} pax on ${input.when}. Can we lock that in for you?`
}
