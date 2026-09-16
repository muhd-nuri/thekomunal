// Komunal: public events, read from Postgres (edited in /admin/events).
import "server-only"
import { asc, desc, eq, inArray } from "drizzle-orm"

import { db, schema } from "@/db"
import type { CommunityEvent } from "@/data/events"

const { events, eventPosters } = schema

async function withPosters(rows: (typeof events.$inferSelect)[]) {
  if (!rows.length) return []
  const posters = await db
    .select()
    .from(eventPosters)
    .where(
      inArray(
        eventPosters.eventId,
        rows.map((r) => r.id)
      )
    )
    .orderBy(asc(eventPosters.sortOrder))
  return rows.map((row): CommunityEvent => ({
    slug: row.slug,
    name: row.name,
    period: row.period,
    venue: row.venue,
    venueNote: row.venueNote || undefined,
    isUpcoming: row.isUpcoming,
    tagline: row.tagline,
    description: row.description,
    posters: posters
      .filter((p) => p.eventId === row.id)
      .map((p) => ({ ...p.image, tilt: p.tilt })),
  }))
}

export async function getPublishedEvents(): Promise<CommunityEvent[]> {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.isPublished, true))
    .orderBy(
      desc(events.isUpcoming),
      asc(events.sortOrder),
      desc(events.createdAt)
    )
  return withPosters(rows)
}

/** The featured event, or the first published one if none is marked. */
export async function getFeaturedEvent(): Promise<CommunityEvent | undefined> {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.isPublished, true))
    .orderBy(
      desc(events.isFeatured),
      asc(events.sortOrder),
      desc(events.createdAt)
    )
    .limit(1)
  const [event] = await withPosters(rows)
  return event
}
