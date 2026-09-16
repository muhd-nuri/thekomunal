// Komunal: the database — reservations, admin auth, and the menu / events CMS.
// Money is integer sen. Images are `{ src, alt, width, height }`; uploads live under /media/.
import {
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
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

/* ------------------------------------------------------------------ auth */

/** Better Auth owns these four tables. Staff only: there are no public accounts. */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("account_user_idx").on(t.userId)]
)

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ------------------------------------------------------------ shared types */

export type StoredImage = {
  src: string
  alt: string
  width: number
  height: number
}

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  /** Email of the staff member who last saved the row. */
  updatedBy: text("updated_by"),
}

/* -------------------------------------------------------------------- menu */

export const menuKind = pgEnum("menu_kind", ["food", "drinks", "extras"])

export const menuCategories = pgTable("menu_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: menuKind("kind").notNull().default("food"),
  /** "8:30 to 11:00 AM", "All day", or empty. */
  availability: text("availability").notNull().default(""),
  image: jsonb("image").$type<StoredImage | null>(),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const menuGroups = pgTable(
  "menu_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    note: text("note"),
    /** Price column headings, e.g. ["Hot", "Cold"]. Empty for a normal list. */
    columns: jsonb("columns").$type<string[]>().notNull().default([]),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("menu_groups_category_idx").on(t.categoryId)]
)

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => menuGroups.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    /** What the price labels choose between, e.g. "Protein". */
    optionsLabel: text("options_label"),
    /** Free choices that don't change the price, e.g. egg styles. */
    choices: jsonb("choices").$type<{
      label: string
      values: string[]
    } | null>(),
    image: jsonb("image").$type<StoredImage | null>(),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isAvailable: boolean("is_available").notNull().default(true),
    /** 1–8 puts the dish in the homepage spread in that order; null keeps it off. */
    signatureOrder: integer("signature_order"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("menu_items_group_idx").on(t.groupId),
    index("menu_items_signature_idx").on(t.signatureOrder),
  ]
)

export const menuItemPrices = pgTable(
  "menu_item_prices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    /** Empty for a single price, an option ("Sambal Udang Petai") or a column ("Hot"). */
    label: text("label").notNull().default(""),
    amount: integer("amount").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("menu_item_prices_item_idx").on(t.itemId)]
)

export const menuCategoryAddOns = pgTable(
  "menu_category_add_ons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    amount: integer("amount").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("menu_category_add_ons_category_idx").on(t.categoryId)]
)

/* ------------------------------------------------------------------ events */

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  /** Free text, e.g. "Ramadan 2025". */
  period: text("period").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  /** Shown today; empty when the original venue has closed. */
  venue: text("venue").notNull().default(""),
  /** Extra context, e.g. "Held at our former Bukit Jelutong branch." */
  venueNote: text("venue_note").notNull().default(""),
  isPublished: boolean("is_published").notNull().default(true),
  /** Upcoming events are labelled "Coming up"; the rest "Past event". */
  isUpcoming: boolean("is_upcoming").notNull().default(false),
  /** The one event the homepage features. */
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const eventPosters = pgTable(
  "event_posters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    image: jsonb("image").$type<StoredImage>().notNull(),
    /** Degrees, −3 to 3, for the noticeboard look. */
    tilt: real("tilt").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("event_posters_event_idx").on(t.eventId)]
)

/* ---------------------------------------------------------------- settings */

export type MenuPdfSetting = {
  src: string
  label: string
  /** Original filename, shown in the admin. */
  filename: string
  bytes: number
}

/** Small site-wide values the CMS edits, keyed by name (e.g. "menu_pdf"). */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  ...timestamps,
})
