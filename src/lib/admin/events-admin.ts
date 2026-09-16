// Komunal: event queries for the CMS (drafts included).
import "server-only"
import { asc, count, desc, eq } from "drizzle-orm"

import { db, schema } from "@/db"
import { isUuid } from "@/lib/admin/menu-admin"

const { events, eventPosters } = schema

export async function listEventsWithCounts() {
  const [rows, counts, covers] = await Promise.all([
    db
      .select()
      .from(events)
      .orderBy(asc(events.sortOrder), desc(events.createdAt)),
    db
      .select({ eventId: eventPosters.eventId, n: count() })
      .from(eventPosters)
      .groupBy(eventPosters.eventId),
    db
      .select({
        eventId: eventPosters.eventId,
        image: eventPosters.image,
        sortOrder: eventPosters.sortOrder,
      })
      .from(eventPosters)
      .orderBy(asc(eventPosters.sortOrder)),
  ])
  const byEvent = new Map(counts.map((c) => [c.eventId, c.n]))
  return rows.map((row) => ({
    ...row,
    posterCount: byEvent.get(row.id) ?? 0,
    cover: covers.find((c) => c.eventId === row.id)?.image ?? null,
  }))
}

export async function getEventWithPosters(id: string) {
  if (!isUuid(id)) return undefined
  const event = await db.query.events.findFirst({ where: eq(events.id, id) })
  if (!event) return undefined
  const posters = await db
    .select()
    .from(eventPosters)
    .where(eq(eventPosters.eventId, id))
    .orderBy(asc(eventPosters.sortOrder))
  return { ...event, posters }
}
