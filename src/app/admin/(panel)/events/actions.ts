"use server"
// Komunal: events CMS actions. Saves refresh the homepage and /community.
import { and, asc, eq, max, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { db, schema } from "@/db"
import type { StoredImage } from "@/db/schema"
import { flag, jsonFrom, text, type FormState } from "@/lib/admin/form"
import { assertAdmin } from "@/lib/admin/guard"
import { isUuid } from "@/lib/admin/menu-admin"
import { slugify } from "@/lib/menu-format"
import { removeUpload } from "@/lib/uploads"

const { events, eventPosters } = schema

function refresh() {
  revalidatePath("/")
  revalidatePath("/community")
  revalidatePath("/admin/events", "layout")
}

const fail = (
  error: string,
  fieldErrors?: Record<string, string>
): FormState => ({
  ok: false,
  error,
  fieldErrors,
  at: Date.now(),
})
const done = (message: string): FormState => ({
  ok: true,
  message,
  at: Date.now(),
})

async function uniqueSlug(wanted: string, exceptId?: string) {
  const base = slugify(wanted) || "event"
  for (let n = 1; n < 100; n++) {
    const slug = n === 1 ? base : `${base}-${n}`
    const [clash] = await db
      .select({ id: events.id })
      .from(events)
      .where(
        exceptId
          ? and(eq(events.slug, slug), ne(events.id, exceptId))
          : eq(events.slug, slug)
      )
      .limit(1)
    if (!clash) return slug
  }
  throw new Error("Could not find a free slug")
}

export async function createEvent(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const name = text(form, "name", 100)
  if (!name) return fail("Give the event a name.", { name: "Required" })
  const [{ top }] = await db.select({ top: max(events.sortOrder) }).from(events)
  const [row] = await db
    .insert(events)
    .values({
      name,
      slug: await uniqueSlug(name),
      isPublished: false,
      isUpcoming: true,
      sortOrder: (top ?? -1) + 1,
      updatedBy: session.user.email,
    })
    .returning({ id: events.id })
  refresh()
  redirect(`/admin/events/${row.id}?created=1`)
}

type PosterInput = {
  src: string
  width: number
  height: number
  alt: string
  tilt: number
}

const SRC_RE = /^\/(media|images)\/[\w./-]+$/

export async function saveEvent(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const id = text(form, "id")
  if (!isUuid(id)) return fail("That event no longer exists.")
  const current = await db.query.events.findFirst({ where: eq(events.id, id) })
  if (!current) return fail("That event no longer exists.")

  const name = text(form, "name", 100)
  const fieldErrors: Record<string, string> = {}
  if (!name) fieldErrors.name = "Required"

  const posters: (StoredImage & { tilt: number })[] = []
  for (const [i, p] of jsonFrom<PosterInput[]>(form, "posters", []).entries()) {
    const src = String(p.src ?? "")
    if (!SRC_RE.test(src) || src.includes("..")) continue
    const alt = String(p.alt ?? "")
      .trim()
      .slice(0, 200)
    if (!alt)
      fieldErrors.posters = `Describe poster ${i + 1} (who is performing, and when).`
    posters.push({
      src,
      alt,
      width: Math.max(1, Math.round(Number(p.width) || 800)),
      height: Math.max(1, Math.round(Number(p.height) || 1000)),
      tilt: Math.max(-3, Math.min(3, Number(p.tilt) || 0)),
    })
  }
  if (posters.length > 12)
    fieldErrors.posters = "Keep it to 12 posters or fewer."
  const isPublished = flag(form, "isPublished")
  if (isPublished && posters.length === 0)
    fieldErrors.posters = "Add at least one poster before publishing."
  if (Object.keys(fieldErrors).length)
    return fail(
      fieldErrors.posters ?? "Check the highlighted fields.",
      fieldErrors
    )

  const isFeatured = flag(form, "isFeatured")
  const previous = await db
    .select({ src: eventPosters.image })
    .from(eventPosters)
    .where(eq(eventPosters.eventId, id))

  await db.transaction(async (tx) => {
    if (isFeatured) {
      await tx
        .update(events)
        .set({ isFeatured: false })
        .where(ne(events.id, id))
    }
    await tx
      .update(events)
      .set({
        name,
        slug: await uniqueSlug(text(form, "slug", 80) || name, id),
        period: text(form, "period", 60),
        tagline: text(form, "tagline", 120),
        description: text(form, "description", 2000),
        venue: text(form, "venue", 120),
        venueNote: text(form, "venueNote", 160),
        isPublished,
        isUpcoming: flag(form, "isUpcoming"),
        isFeatured,
        updatedBy: session.user.email,
      })
      .where(eq(events.id, id))
    await tx.delete(eventPosters).where(eq(eventPosters.eventId, id))
    if (posters.length)
      await tx.insert(eventPosters).values(
        posters.map(({ tilt, ...image }, sortOrder) => ({
          eventId: id,
          image,
          tilt,
          sortOrder,
        }))
      )
  })

  const kept = new Set(posters.map((p) => p.src))
  await Promise.all(
    previous
      .filter((p) => !kept.has(p.src.src))
      .map((p) => removeUpload(p.src.src))
  )
  refresh()
  return done(`${name} saved.`)
}

export async function setEventPublished(id: string, isPublished: boolean) {
  const session = await assertAdmin()
  if (!isUuid(id)) return { ok: false, error: "Not found" }
  if (isPublished) {
    const [poster] = await db
      .select({ id: eventPosters.id })
      .from(eventPosters)
      .where(eq(eventPosters.eventId, id))
      .limit(1)
    if (!poster) return { ok: false, error: "Add a poster before publishing." }
  }
  await db
    .update(events)
    .set({ isPublished, updatedBy: session.user.email })
    .where(eq(events.id, id))
  refresh()
  return { ok: true }
}

export async function setFeaturedEvent(id: string) {
  await assertAdmin()
  if (!isUuid(id)) return
  await db.transaction(async (tx) => {
    await tx.update(events).set({ isFeatured: false }).where(ne(events.id, id))
    await tx.update(events).set({ isFeatured: true }).where(eq(events.id, id))
  })
  refresh()
}

export async function moveEvent(id: string, direction: "up" | "down") {
  await assertAdmin()
  const rows = await db
    .select({ id: events.id })
    .from(events)
    .orderBy(asc(events.sortOrder), asc(events.createdAt))
  const ids = rows.map((r) => r.id)
  const index = ids.indexOf(id)
  const target = direction === "up" ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= ids.length) return
  ;[ids[index], ids[target]] = [ids[target], ids[index]]
  await Promise.all(
    ids.map((rowId, sortOrder) =>
      db.update(events).set({ sortOrder }).where(eq(events.id, rowId))
    )
  )
  refresh()
}

export async function deleteEvent(id: string) {
  await assertAdmin()
  if (!isUuid(id)) return
  const posters = await db
    .select({ image: eventPosters.image })
    .from(eventPosters)
    .where(eq(eventPosters.eventId, id))
  await db.delete(events).where(eq(events.id, id))
  await Promise.all(posters.map((p) => removeUpload(p.image.src)))
  refresh()
  redirect("/admin/events?deleted=1")
}
