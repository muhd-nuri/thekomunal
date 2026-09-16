// Komunal: reservations table — every booking with its attribution snapshot and Telegram delivery state.
import {
  bigint,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const reservationStatus = pgEnum("reservation_status", [
  "new",
  "contacted",
  "confirmed",
  "cancelled",
  "no_show",
])

export const notifyStatus = pgEnum("notify_status", [
  "pending",
  "sent",
  "failed",
])

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** KM-7F3K2 — quoted by staff and guest */
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phoneRaw: text("phone_raw").notNull(),
    /** 601XXXXXXXX — wa.me format */
    phoneE164: text("phone_e164").notNull(),
    company: text("company"),
    eventType: text("event_type"),
    outletSlug: text("outlet_slug").notNull(),
    guests: integer("guests").notNull(),
    /** Kuala Lumpur local date */
    reservedDate: date("reserved_date", { mode: "string" }).notNull(),
    /** "19:30", Kuala Lumpur local */
    reservedTime: text("reserved_time").notNull(),
    reservedAt: timestamp("reserved_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    status: reservationStatus("status").notNull().default("new"),

    // Attribution — last touch, flattened for filtering
    sourceChannel: text("source_channel").notNull().default("direct"),
    sourceDetail: text("source_detail"),
    refCode: text("ref_code"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
    /** fbclid | gclid | ttclid */
    clickIdType: text("click_id_type"),
    clickId: text("click_id"),
    referrerUrl: text("referrer_url"),
    landingPath: text("landing_path"),
    submitPath: text("submit_path"),
    /** First touch, raw cookie shape */
    firstTouch: jsonb("first_touch"),

    userAgent: text("user_agent"),
    /** sha256(ip + IP_HASH_SALT) — raw IPs are never stored */
    ipHash: text("ip_hash"),

    telegramStatus: notifyStatus("telegram_status")
      .notNull()
      .default("pending"),
    telegramMessageId: bigint("telegram_message_id", { mode: "number" }),
    telegramError: text("telegram_error"),

    contactedAt: timestamp("contacted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("reservations_created_idx").on(t.createdAt),
    index("reservations_outlet_date_idx").on(t.outletSlug, t.reservedDate),
    index("reservations_status_idx").on(t.status),
    index("reservations_channel_idx").on(t.sourceChannel),
    index("reservations_ref_idx").on(t.refCode),
    // Rate limit looks up recent rows by hashed IP.
    index("reservations_ip_created_idx").on(t.ipHash, t.createdAt),
  ]
)

export type Reservation = typeof reservations.$inferSelect
export type NewReservation = typeof reservations.$inferInsert
