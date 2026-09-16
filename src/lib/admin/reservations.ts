// Komunal: reservation queries for the admin — one filter shape shared by the list,
// the CSV export and the sources report.
import "server-only"
import {
  and,
  count,
  desc,
  asc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
  sum,
  type SQL,
} from "drizzle-orm"

import { db } from "@/db"
import { reservations } from "@/db/schema"
import { channelLabels, type SourceChannel } from "@/lib/attribution"
import {
  statusLabels,
  statusValues,
  type ReservationStatus,
} from "@/lib/admin/reservation-labels"

export { statusLabels, statusValues, type ReservationStatus }

export const channelValues = Object.keys(channelLabels) as SourceChannel[]

export type ReservationFilters = {
  q?: string
  status?: ReservationStatus
  channel?: SourceChannel
  ref?: string
  outlet?: string
  /** yyyy-MM-dd, inclusive */
  from?: string
  to?: string
  /** Which date `from`/`to` apply to. */
  dateField: "reserved" | "created"
  sort: "reserved_desc" | "reserved_asc" | "created_desc"
  page: number
}

export const PAGE_SIZE = 25

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const one = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined

/** Parses search params into safe filters; anything unexpected is dropped. */
export function parseFilters(
  params: Record<string, string | string[] | undefined>
): ReservationFilters {
  const status = one(params.status)
  const channel = one(params.channel)
  const from = one(params.from)
  const to = one(params.to)
  const sort = one(params.sort)
  const page = Number(one(params.page) ?? 1)
  return {
    q: one(params.q)?.slice(0, 100),
    status: statusValues.includes(status as ReservationStatus)
      ? (status as ReservationStatus)
      : undefined,
    channel: channelValues.includes(channel as SourceChannel)
      ? (channel as SourceChannel)
      : undefined,
    ref: one(params.ref)?.slice(0, 64),
    outlet: one(params.outlet)?.slice(0, 64),
    from: from && DATE_RE.test(from) ? from : undefined,
    to: to && DATE_RE.test(to) ? to : undefined,
    dateField: one(params.date) === "created" ? "created" : "reserved",
    sort:
      sort === "reserved_asc" || sort === "created_desc"
        ? sort
        : "reserved_desc",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

/** Back to a query string, for pagination and export links. */
export function filtersToSearch(
  filters: Partial<ReservationFilters>,
  overrides: Record<string, string | number | undefined> = {}
) {
  const params = new URLSearchParams()
  const entries: Record<string, string | number | undefined> = {
    q: filters.q,
    status: filters.status,
    channel: filters.channel,
    ref: filters.ref,
    outlet: filters.outlet,
    from: filters.from,
    to: filters.to,
    date: filters.dateField === "created" ? "created" : undefined,
    sort: filters.sort === "reserved_desc" ? undefined : filters.sort,
    page: filters.page && filters.page > 1 ? filters.page : undefined,
    ...overrides,
  }
  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined && value !== "") params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ""
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&")

// created_at is a timestamp; compare against Kuala Lumpur calendar days.
const createdDay = sql`(${reservations.createdAt} at time zone 'Asia/Kuala_Lumpur')::date`

export function whereFor(filters: Omit<ReservationFilters, "page" | "sort">) {
  const clauses: SQL[] = []
  if (filters.q) {
    const term = `%${escapeLike(filters.q)}%`
    const digits = filters.q.replace(/\D/g, "")
    const search = [
      ilike(reservations.name, term),
      ilike(reservations.email, term),
      ilike(reservations.code, term),
      ilike(reservations.company, term),
    ]
    if (digits.length >= 4) {
      search.push(
        ilike(reservations.phoneE164, `%${digits.replace(/^0/, "")}%`)
      )
    }
    clauses.push(or(...search)!)
  }
  if (filters.status) clauses.push(eq(reservations.status, filters.status))
  if (filters.channel)
    clauses.push(eq(reservations.sourceChannel, filters.channel))
  if (filters.ref)
    clauses.push(ilike(reservations.refCode, escapeLike(filters.ref)))
  if (filters.outlet) clauses.push(eq(reservations.outletSlug, filters.outlet))
  if (filters.dateField === "created") {
    if (filters.from) clauses.push(sql`${createdDay} >= ${filters.from}`)
    if (filters.to) clauses.push(sql`${createdDay} <= ${filters.to}`)
  } else {
    if (filters.from) clauses.push(gte(reservations.reservedDate, filters.from))
    if (filters.to) clauses.push(lte(reservations.reservedDate, filters.to))
  }
  return clauses.length ? and(...clauses) : undefined
}

function orderFor(sort: ReservationFilters["sort"]) {
  switch (sort) {
    case "reserved_asc":
      return [asc(reservations.reservedAt), asc(reservations.createdAt)]
    case "created_desc":
      return [desc(reservations.createdAt)]
    default:
      return [desc(reservations.reservedAt), desc(reservations.createdAt)]
  }
}

export async function listReservations(filters: ReservationFilters) {
  const where = whereFor(filters)
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(reservations)
      .where(where)
      .orderBy(...orderFor(filters.sort))
      .limit(PAGE_SIZE)
      .offset((filters.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(reservations).where(where),
  ])
  return { rows, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

/** Everything matching the filters, for CSV. Capped so a runaway export can't exhaust memory. */
export async function exportReservations(filters: ReservationFilters) {
  return db
    .select()
    .from(reservations)
    .where(whereFor(filters))
    .orderBy(...orderFor(filters.sort))
    .limit(50_000)
}

export async function getReservation(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined
  return db.query.reservations.findFirst({ where: eq(reservations.id, id) })
}

/** Bookings and guests grouped by channel and by ref code, for a date range. */
export async function sourcesReport(
  filters: Pick<ReservationFilters, "from" | "to" | "dateField" | "outlet">
) {
  const where = whereFor(filters)
  const guests = sql<number>`coalesce(${sum(reservations.guests)}, 0)::int`
  const confirmed = sql<number>`count(*) filter (where ${reservations.status} = 'confirmed')::int`
  const [byChannel, byRef, [totals]] = await Promise.all([
    db
      .select({
        channel: reservations.sourceChannel,
        bookings: count(),
        guests,
        confirmed,
      })
      .from(reservations)
      .where(where)
      .groupBy(reservations.sourceChannel)
      .orderBy(desc(count())),
    db
      .select({
        ref: reservations.refCode,
        bookings: count(),
        guests,
        confirmed,
      })
      .from(reservations)
      .where(and(where, sql`${reservations.refCode} is not null`))
      .groupBy(reservations.refCode)
      .orderBy(desc(count())),
    db
      .select({ bookings: count(), guests, confirmed })
      .from(reservations)
      .where(where),
  ])
  return { byChannel, byRef, totals }
}

/** Counts for the overview cards (Kuala Lumpur calendar days). */
export async function overviewCounts(today: string, weekEnd: string) {
  const [row] = await db
    .select({
      newCount: sql<number>`count(*) filter (where ${reservations.status} = 'new')::int`,
      todayCount: sql<number>`count(*) filter (where ${reservations.reservedDate} = ${today} and ${reservations.status} not in ('cancelled', 'no_show'))::int`,
      todayGuests: sql<number>`coalesce(sum(${reservations.guests}) filter (where ${reservations.reservedDate} = ${today} and ${reservations.status} not in ('cancelled', 'no_show')), 0)::int`,
      weekCount: sql<number>`count(*) filter (where ${reservations.reservedDate} between ${today} and ${weekEnd} and ${reservations.status} not in ('cancelled', 'no_show'))::int`,
      failedTelegram: sql<number>`count(*) filter (where ${reservations.telegramStatus} = 'failed')::int`,
    })
    .from(reservations)
  return row
}

export async function upcomingReservations(today: string, limit = 8) {
  return db
    .select()
    .from(reservations)
    .where(
      and(
        gte(reservations.reservedDate, today),
        sql`${reservations.status} not in ('cancelled', 'no_show')`
      )
    )
    .orderBy(asc(reservations.reservedAt))
    .limit(limit)
}
