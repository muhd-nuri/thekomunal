"use server"
// Komunal: menu CMS actions. Every action checks the session, validates input, and
// refreshes the public homepage and /menu so edits show without a redeploy.
import { and, asc, eq, inArray, isNotNull, max, ne, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { db, schema } from "@/db"
import type { MenuPdfSetting } from "@/db/schema"
import {
  flag,
  imageFrom,
  jsonFrom,
  text,
  type FormState,
} from "@/lib/admin/form"
import { assertAdmin } from "@/lib/admin/guard"
import { isUuid } from "@/lib/admin/menu-admin"
import { MENU_PDF_KEY, SIGNATURE_LIMIT } from "@/lib/menu"
import { parseRinggit, slugify } from "@/lib/menu-format"
import { removeUpload, savePdf, UploadError } from "@/lib/uploads"

const {
  menuCategories,
  menuGroups,
  menuItems,
  menuItemPrices,
  menuCategoryAddOns,
  siteSettings,
} = schema

const KINDS = ["food", "drinks", "extras"] as const
type Kind = (typeof KINDS)[number]

function refresh() {
  revalidatePath("/")
  revalidatePath("/menu")
  revalidatePath("/admin/menu", "layout")
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

/** A slug that no other row in `table` uses (appends -2, -3…). */
async function uniqueSlug(
  table: typeof menuCategories | typeof menuItems,
  wanted: string,
  exceptId?: string
) {
  const base = slugify(wanted) || "item"
  for (let n = 1; n < 100; n++) {
    const slug = n === 1 ? base : `${base}-${n}`
    const [clash] = await db
      .select({ id: table.id })
      .from(table)
      .where(
        exceptId
          ? and(eq(table.slug, slug), ne(table.id, exceptId))
          : eq(table.slug, slug)
      )
      .limit(1)
    if (!clash) return slug
  }
  throw new Error("Could not find a free slug")
}

/** Rewrites sort_order 0..n with `id` moved one place up or down. */
async function reorder(
  ids: string[],
  id: string,
  direction: "up" | "down",
  write: (id: string, sortOrder: number) => Promise<unknown>
) {
  const index = ids.indexOf(id)
  const target = direction === "up" ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= ids.length) return
  ;[ids[index], ids[target]] = [ids[target], ids[index]]
  await Promise.all(ids.map((rowId, i) => write(rowId, i)))
}

/* --------------------------------------------------------------- categories */

export async function createCategory(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const name = text(form, "name", 80)
  const kind = text(form, "kind") as Kind
  if (!name) return fail("Give the section a name.", { name: "Required" })
  if (!KINDS.includes(kind)) return fail("Pick a section type.")

  const [{ top }] = await db
    .select({ top: max(menuCategories.sortOrder) })
    .from(menuCategories)
  const slug = await uniqueSlug(menuCategories, name)
  const id = await db.transaction(async (tx) => {
    const [category] = await tx
      .insert(menuCategories)
      .values({
        name,
        slug,
        kind,
        availability: kind === "extras" ? "" : "All day",
        // New sections stay hidden until they have dishes and are switched on.
        isVisible: false,
        sortOrder: (top ?? -1) + 1,
        updatedBy: session.user.email,
      })
      .returning({ id: menuCategories.id })
    await tx.insert(menuGroups).values({
      categoryId: category.id,
      name,
      updatedBy: session.user.email,
    })
    return category.id
  })
  refresh()
  redirect(`/admin/menu/${id}?created=1`)
}

export async function updateCategory(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const id = text(form, "id")
  if (!isUuid(id)) return fail("That section no longer exists.")
  const current = await db.query.menuCategories.findFirst({
    where: eq(menuCategories.id, id),
  })
  if (!current) return fail("That section no longer exists.")

  const name = text(form, "name", 80)
  const kind = text(form, "kind") as Kind
  const slugInput = text(form, "slug", 80)
  if (!name) return fail("Give the section a name.", { name: "Required" })
  if (!KINDS.includes(kind)) return fail("Pick a section type.")
  const slug = await uniqueSlug(menuCategories, slugInput || name, id)
  const image = imageFrom(form, "image")
  if (image && !image.alt)
    return fail("Describe the photo for people who can't see it.", {
      imageAlt: "Required",
    })

  await db
    .update(menuCategories)
    .set({
      name,
      slug,
      kind,
      availability: text(form, "availability", 60),
      isVisible: flag(form, "isVisible"),
      image,
      updatedBy: session.user.email,
    })
    .where(eq(menuCategories.id, id))
  if (current.image?.src && current.image.src !== image?.src)
    await removeUpload(current.image.src)
  refresh()
  return done("Section saved.")
}

export async function setCategoryVisible(id: string, isVisible: boolean) {
  const session = await assertAdmin()
  if (!isUuid(id)) return
  await db
    .update(menuCategories)
    .set({ isVisible, updatedBy: session.user.email })
    .where(eq(menuCategories.id, id))
  refresh()
}

export async function moveCategory(id: string, direction: "up" | "down") {
  await assertAdmin()
  const rows = await db
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.createdAt))
  await reorder(
    rows.map((r) => r.id),
    id,
    direction,
    (rowId, sortOrder) =>
      db
        .update(menuCategories)
        .set({ sortOrder })
        .where(eq(menuCategories.id, rowId))
  )
  refresh()
}

export async function deleteCategory(id: string) {
  await assertAdmin()
  if (!isUuid(id)) return
  const category = await db.query.menuCategories.findFirst({
    where: eq(menuCategories.id, id),
  })
  if (!category) redirect("/admin/menu")
  const images = await db
    .select({ image: menuItems.image })
    .from(menuItems)
    .innerJoin(menuGroups, eq(menuItems.groupId, menuGroups.id))
    .where(eq(menuGroups.categoryId, id))
  await db.delete(menuCategories).where(eq(menuCategories.id, id))
  await Promise.all([
    removeUpload(category.image?.src),
    ...images.map((row) => removeUpload(row.image?.src)),
  ])
  refresh()
  redirect("/admin/menu?deleted=1")
}

export async function saveAddOns(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  await assertAdmin()
  const categoryId = text(form, "categoryId")
  if (!isUuid(categoryId)) return fail("That section no longer exists.")
  const rows = jsonFrom<{ label: string; amount: string }[]>(form, "addOns", [])
  const clean: { label: string; amount: number }[] = []
  for (const [i, row] of rows.entries()) {
    const label = String(row.label ?? "")
      .trim()
      .slice(0, 80)
    const amountText = String(row.amount ?? "").trim()
    if (!label && !amountText) continue
    const amount = parseRinggit(amountText)
    if (!label || amount === null)
      return fail(`Add-on ${i + 1} needs a name and a price like 4 or 4.50.`)
    clean.push({ label, amount })
  }
  await db.transaction(async (tx) => {
    await tx
      .delete(menuCategoryAddOns)
      .where(eq(menuCategoryAddOns.categoryId, categoryId))
    if (clean.length)
      await tx
        .insert(menuCategoryAddOns)
        .values(
          clean.map((row, sortOrder) => ({ ...row, categoryId, sortOrder }))
        )
  })
  refresh()
  return done("Add-ons saved.")
}

/* ------------------------------------------------------------------- groups */

export async function createGroup(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const categoryId = text(form, "categoryId")
  const name = text(form, "name", 80)
  if (!isUuid(categoryId)) return fail("That section no longer exists.")
  if (!name) return fail("Give the group a name.", { name: "Required" })
  const [{ top }] = await db
    .select({ top: max(menuGroups.sortOrder) })
    .from(menuGroups)
    .where(eq(menuGroups.categoryId, categoryId))
  await db.insert(menuGroups).values({
    categoryId,
    name,
    sortOrder: (top ?? -1) + 1,
    updatedBy: session.user.email,
  })
  refresh()
  return done(`Group "${name}" added.`)
}

function parseColumns(input: string) {
  return [
    ...new Set(
      input
        .split(",")
        .map((c) => c.trim().slice(0, 20))
        .filter(Boolean)
    ),
  ].slice(0, 4)
}

export async function updateGroup(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const id = text(form, "id")
  const name = text(form, "name", 80)
  if (!isUuid(id)) return fail("That group no longer exists.")
  if (!name) return fail("Give the group a name.", { name: "Required" })
  const columns = parseColumns(text(form, "columns", 120))

  if (columns.length) {
    // Every price in a column group must sit in one of its columns.
    const stray = await db
      .select({ name: menuItems.name, label: menuItemPrices.label })
      .from(menuItemPrices)
      .innerJoin(menuItems, eq(menuItemPrices.itemId, menuItems.id))
      .where(
        and(
          eq(menuItems.groupId, id),
          sql`${menuItemPrices.label} not in (${sql.join(
            columns.map((c) => sql`${c}`),
            sql`, `
          )})`
        )
      )
      .limit(1)
    if (stray.length)
      return fail(
        `"${stray[0].name}" has a price labelled "${stray[0].label || "(none)"}". Edit it to use ${columns.join(" / ")} first.`
      )
  }

  await db
    .update(menuGroups)
    .set({
      name,
      note: text(form, "note", 200) || null,
      columns,
      updatedBy: session.user.email,
    })
    .where(eq(menuGroups.id, id))
  refresh()
  return done("Group saved.")
}

export async function moveGroup(id: string, direction: "up" | "down") {
  await assertAdmin()
  const group = await db.query.menuGroups.findFirst({
    where: eq(menuGroups.id, id),
  })
  if (!group) return
  const rows = await db
    .select({ id: menuGroups.id })
    .from(menuGroups)
    .where(eq(menuGroups.categoryId, group.categoryId))
    .orderBy(asc(menuGroups.sortOrder), asc(menuGroups.createdAt))
  await reorder(
    rows.map((r) => r.id),
    id,
    direction,
    (rowId, sortOrder) =>
      db.update(menuGroups).set({ sortOrder }).where(eq(menuGroups.id, rowId))
  )
  refresh()
}

export async function deleteGroup(id: string) {
  await assertAdmin()
  if (!isUuid(id)) return
  const images = await db
    .select({ image: menuItems.image })
    .from(menuItems)
    .where(eq(menuItems.groupId, id))
  await db.delete(menuGroups).where(eq(menuGroups.id, id))
  await Promise.all(images.map((row) => removeUpload(row.image?.src)))
  refresh()
}

/* -------------------------------------------------------------------- items */

type PriceInput = { label: string; amount: string }

export async function saveItem(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const id = text(form, "id")
  const isNew = !id
  if (!isNew && !isUuid(id)) return fail("That dish no longer exists.")
  const current = isNew
    ? undefined
    : await db.query.menuItems.findFirst({ where: eq(menuItems.id, id) })
  if (!isNew && !current) return fail("That dish no longer exists.")

  const groupId = text(form, "groupId")
  const group = isUuid(groupId)
    ? await db.query.menuGroups.findFirst({ where: eq(menuGroups.id, groupId) })
    : undefined
  if (!group) return fail("Pick where this dish goes.", { groupId: "Required" })

  const name = text(form, "name", 100)
  const fieldErrors: Record<string, string> = {}
  if (!name) fieldErrors.name = "Required"

  // Prices: one blank-label price, labelled options, or one per group column.
  const priceRows = jsonFrom<PriceInput[]>(form, "prices", [])
  const prices: { label: string; amount: number }[] = []
  let priceError: string | undefined
  for (const row of priceRows) {
    const label = String(row.label ?? "")
      .trim()
      .slice(0, 60)
    const amountText = String(row.amount ?? "").trim()
    if (!amountText && (group.columns.length || !label)) continue
    const amount = parseRinggit(amountText)
    if (amount === null) {
      priceError = `"${amountText}" isn't a price. Use numbers like 12 or 12.50.`
      break
    }
    if (group.columns.length && !group.columns.includes(label)) {
      priceError = `This group's prices are ${group.columns.join(" / ")}.`
      break
    }
    prices.push({ label, amount })
  }
  if (!priceError && prices.length === 0) priceError = "Add at least one price."
  if (
    !priceError &&
    !group.columns.length &&
    prices.length > 1 &&
    prices.some((p) => !p.label)
  )
    priceError = "When a dish has more than one price, name each option."
  if (!priceError && new Set(prices.map((p) => p.label)).size !== prices.length)
    priceError = "Two prices have the same name."
  if (priceError) fieldErrors.prices = priceError

  const image = imageFrom(form, "image")
  if (image && !image.alt) fieldErrors.imageAlt = "Describe the photo"

  const onHomepage = flag(form, "onHomepage")
  const isAvailable = flag(form, "isAvailable")
  if (onHomepage && !image) fieldErrors.image = "Homepage dishes need a photo"

  if (Object.keys(fieldErrors).length)
    return fail(
      fieldErrors.prices ?? "Check the highlighted fields.",
      fieldErrors
    )

  let signatureOrder = current?.signatureOrder ?? null
  if (onHomepage && signatureOrder === null) {
    const taken = await db
      .select({ order: menuItems.signatureOrder })
      .from(menuItems)
      .where(isNotNull(menuItems.signatureOrder))
    if (taken.length >= SIGNATURE_LIMIT)
      return fail(
        `The homepage already shows ${SIGNATURE_LIMIT} dishes. Remove one on the Menu page first.`
      )
    signatureOrder = Math.max(0, ...taken.map((t) => t.order ?? 0)) + 1
  }
  if (!onHomepage) signatureOrder = null

  const choiceValues = text(form, "choiceValues", 300)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
  const choices = choiceValues.length
    ? { label: text(form, "choiceLabel", 40) || "Choice", values: choiceValues }
    : null

  const slug = await uniqueSlug(
    menuItems,
    text(form, "slug", 80) || name,
    current?.id
  )
  const values = {
    groupId,
    slug,
    name,
    description: text(form, "description", 600) || null,
    optionsLabel: group.columns.length
      ? null
      : text(form, "optionsLabel", 40) || null,
    choices,
    image,
    isBestSeller: flag(form, "isBestSeller"),
    isAvailable,
    signatureOrder,
    updatedBy: session.user.email,
  }

  let itemId: string
  try {
    itemId = await writeItem()
  } catch (error) {
    if (isSignatureClash(error))
      return fail("Someone else just took that homepage slot. Save again.")
    throw error
  }

  if (current?.image?.src && current.image.src !== image?.src)
    await removeUpload(current.image.src)
  if (current?.signatureOrder && !signatureOrder) await compactSignature()
  refresh()

  if (isNew)
    redirect(
      `/admin/menu/${group.categoryId}?saved=${encodeURIComponent(name)}#item-${itemId}`
    )
  return done(`${name} saved.`)

  /** Writes the dish and replaces its prices in one transaction. */
  async function writeItem() {
    return db.transaction(async (tx) => {
      let rowId = current?.id
      if (!rowId) {
        const [{ top }] = await tx
          .select({ top: max(menuItems.sortOrder) })
          .from(menuItems)
          .where(eq(menuItems.groupId, groupId))
        const [created] = await tx
          .insert(menuItems)
          .values({ ...values, sortOrder: (top ?? -1) + 1 })
          .returning({ id: menuItems.id })
        rowId = created.id
      } else {
        const moved = current!.groupId !== groupId
        let sortOrder = current!.sortOrder
        if (moved) {
          const [{ top }] = await tx
            .select({ top: max(menuItems.sortOrder) })
            .from(menuItems)
            .where(eq(menuItems.groupId, groupId))
          sortOrder = (top ?? -1) + 1
        }
        await tx
          .update(menuItems)
          .set({ ...values, sortOrder })
          .where(eq(menuItems.id, rowId))
        await tx.delete(menuItemPrices).where(eq(menuItemPrices.itemId, rowId))
      }
      await tx
        .insert(menuItemPrices)
        .values(
          prices.map((p, sortOrder) => ({ ...p, itemId: rowId!, sortOrder }))
        )
      return rowId
    })
  }
}

function isSignatureClash(error: unknown) {
  type PgError = { code?: string; constraint_name?: string; cause?: PgError }
  const e = error as PgError
  const code = e?.code ?? e?.cause?.code
  const constraint = e?.constraint_name ?? e?.cause?.constraint_name
  return code === "23505" && constraint === "menu_items_signature_unique"
}

export async function setItemAvailable(id: string, isAvailable: boolean) {
  const session = await assertAdmin()
  if (!isUuid(id)) return
  await db
    .update(menuItems)
    .set({ isAvailable, updatedBy: session.user.email })
    .where(eq(menuItems.id, id))
  refresh()
}

export async function moveItem(id: string, direction: "up" | "down") {
  await assertAdmin()
  const item = await db.query.menuItems.findFirst({
    where: eq(menuItems.id, id),
  })
  if (!item) return
  const rows = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(eq(menuItems.groupId, item.groupId))
    .orderBy(asc(menuItems.sortOrder), asc(menuItems.createdAt))
  await reorder(
    rows.map((r) => r.id),
    id,
    direction,
    (rowId, sortOrder) =>
      db.update(menuItems).set({ sortOrder }).where(eq(menuItems.id, rowId))
  )
  refresh()
}

export async function deleteItem(id: string, returnTo?: string) {
  await assertAdmin()
  if (!isUuid(id)) return
  const item = await db.query.menuItems.findFirst({
    where: eq(menuItems.id, id),
  })
  if (!item) return
  await db.delete(menuItems).where(eq(menuItems.id, id))
  await removeUpload(item.image?.src)
  if (item.signatureOrder) await compactSignature()
  refresh()
  if (returnTo?.startsWith("/admin/menu")) redirect(returnTo)
}

/* ---------------------------------------------------------------- homepage */

/** Renumbers homepage slots 1..n in their current order. */
async function compactSignature(order?: string[]) {
  const ids =
    order ??
    (
      await db
        .select({ id: menuItems.id })
        .from(menuItems)
        .where(isNotNull(menuItems.signatureOrder))
        .orderBy(asc(menuItems.signatureOrder))
    ).map((r) => r.id)
  if (!ids.length) return
  // Slots are unique, so clear them first; a swap would otherwise clash mid-update.
  await db.transaction(async (tx) => {
    await tx
      .update(menuItems)
      .set({ signatureOrder: null })
      .where(inArray(menuItems.id, ids))
    for (const [i, id] of ids.entries()) {
      await tx
        .update(menuItems)
        .set({ signatureOrder: i + 1 })
        .where(eq(menuItems.id, id))
    }
  })
}

export async function moveSignature(id: string, direction: "up" | "down") {
  await assertAdmin()
  const rows = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(isNotNull(menuItems.signatureOrder))
    .orderBy(asc(menuItems.signatureOrder))
  const ids = rows.map((r) => r.id)
  await reorder(ids, id, direction, async () => {})
  await compactSignature(ids)
  refresh()
}

export async function removeSignature(id: string) {
  await assertAdmin()
  if (!isUuid(id)) return
  await db
    .update(menuItems)
    .set({ signatureOrder: null })
    .where(eq(menuItems.id, id))
  await compactSignature()
  refresh()
}

/* --------------------------------------------------------------- menu PDF */

export async function saveMenuPdf(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const current = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, MENU_PDF_KEY),
  })
  const previous = current?.value as MenuPdfSetting | undefined
  const label = text(form, "label", 60) || "Full menu (PDF)"
  const file = form.get("file")

  let next: MenuPdfSetting
  if (file instanceof File && file.size > 0) {
    try {
      const saved = await savePdf(file)
      next = {
        src: saved.src,
        bytes: saved.bytes,
        filename: file.name.slice(0, 120),
        label,
      }
    } catch (error) {
      if (error instanceof UploadError) return fail(error.message)
      console.error("[menu pdf]", error)
      return fail("That upload didn't work. Try again.")
    }
  } else if (previous) {
    next = { ...previous, label }
  } else {
    return fail("Choose a PDF to upload.")
  }

  await db
    .insert(siteSettings)
    .values({ key: MENU_PDF_KEY, value: next, updatedBy: session.user.email })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value: next,
        updatedBy: session.user.email,
        updatedAt: new Date(),
      },
    })
  if (previous?.src && previous.src !== next.src)
    await removeUpload(previous.src)
  refresh()
  return done(
    file instanceof File && file.size > 0
      ? "New menu PDF is live."
      : "Label saved."
  )
}
