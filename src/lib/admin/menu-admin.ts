// Komunal: menu queries for the CMS — everything, including hidden and sold-out rows.
import "server-only"
import { asc, count, eq, inArray, isNotNull } from "drizzle-orm"

import { db, schema } from "@/db"

const {
  menuCategories,
  menuGroups,
  menuItems,
  menuItemPrices,
  menuCategoryAddOns,
} = schema

const UUID_RE = /^[0-9a-f-]{36}$/i
export const isUuid = (value: string) => UUID_RE.test(value)

export async function listCategoriesWithCounts() {
  const [categories, groupCounts, itemCounts] = await Promise.all([
    db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder)),
    db
      .select({ categoryId: menuGroups.categoryId, n: count() })
      .from(menuGroups)
      .groupBy(menuGroups.categoryId),
    db
      .select({ categoryId: menuGroups.categoryId, n: count() })
      .from(menuItems)
      .innerJoin(menuGroups, eq(menuItems.groupId, menuGroups.id))
      .groupBy(menuGroups.categoryId),
  ])
  const groups = new Map(groupCounts.map((r) => [r.categoryId, r.n]))
  const items = new Map(itemCounts.map((r) => [r.categoryId, r.n]))
  return categories.map((c) => ({
    ...c,
    groupCount: groups.get(c.id) ?? 0,
    itemCount: items.get(c.id) ?? 0,
  }))
}

export async function getCategoryTree(id: string) {
  if (!isUuid(id)) return undefined
  const category = await db.query.menuCategories.findFirst({
    where: eq(menuCategories.id, id),
  })
  if (!category) return undefined
  const [groups, addOns] = await Promise.all([
    db
      .select()
      .from(menuGroups)
      .where(eq(menuGroups.categoryId, id))
      .orderBy(asc(menuGroups.sortOrder)),
    db
      .select()
      .from(menuCategoryAddOns)
      .where(eq(menuCategoryAddOns.categoryId, id))
      .orderBy(asc(menuCategoryAddOns.sortOrder)),
  ])
  const groupIds = groups.map((g) => g.id)
  const items = groupIds.length
    ? await db
        .select()
        .from(menuItems)
        .where(inArray(menuItems.groupId, groupIds))
        .orderBy(asc(menuItems.sortOrder))
    : []
  const prices = items.length
    ? await db
        .select()
        .from(menuItemPrices)
        .where(
          inArray(
            menuItemPrices.itemId,
            items.map((i) => i.id)
          )
        )
        .orderBy(asc(menuItemPrices.sortOrder))
    : []
  return {
    category,
    addOns,
    groups: groups.map((group) => ({
      ...group,
      items: items
        .filter((item) => item.groupId === group.id)
        .map((item) => ({
          ...item,
          prices: prices.filter((p) => p.itemId === item.id),
        })),
    })),
  }
}

export async function getItemWithPrices(id: string) {
  if (!isUuid(id)) return undefined
  const item = await db.query.menuItems.findFirst({
    where: eq(menuItems.id, id),
  })
  if (!item) return undefined
  const prices = await db
    .select()
    .from(menuItemPrices)
    .where(eq(menuItemPrices.itemId, id))
    .orderBy(asc(menuItemPrices.sortOrder))
  return { ...item, prices }
}

export async function getGroupWithCategory(id: string) {
  if (!isUuid(id)) return undefined
  const [row] = await db
    .select({ group: menuGroups, category: menuCategories })
    .from(menuGroups)
    .innerJoin(menuCategories, eq(menuGroups.categoryId, menuCategories.id))
    .where(eq(menuGroups.id, id))
  return row
}

/** Every group, labelled "Category › Group", for the item form's "move to" select. */
export async function listGroupOptions() {
  const rows = await db
    .select({
      id: menuGroups.id,
      group: menuGroups.name,
      category: menuCategories.name,
      columns: menuGroups.columns,
    })
    .from(menuGroups)
    .innerJoin(menuCategories, eq(menuGroups.categoryId, menuCategories.id))
    .orderBy(asc(menuCategories.sortOrder), asc(menuGroups.sortOrder))
  return rows.map((r) => ({
    id: r.id,
    label: r.group === r.category ? r.category : `${r.category} › ${r.group}`,
    columns: r.columns,
  }))
}

export async function listSignatureItems() {
  return db
    .select({
      id: menuItems.id,
      name: menuItems.name,
      image: menuItems.image,
      isAvailable: menuItems.isAvailable,
      signatureOrder: menuItems.signatureOrder,
      category: menuCategories.name,
      categoryVisible: menuCategories.isVisible,
    })
    .from(menuItems)
    .innerJoin(menuGroups, eq(menuItems.groupId, menuGroups.id))
    .innerJoin(menuCategories, eq(menuGroups.categoryId, menuCategories.id))
    .where(isNotNull(menuItems.signatureOrder))
    .orderBy(asc(menuItems.signatureOrder))
}
