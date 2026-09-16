// Komunal: pure menu helpers (no database), shared by the site, the admin and tests.
import type { MenuCategory, MenuImage, MenuItem, MenuPrice } from "@/data/menu"
import type { StoredImage } from "@/db/schema"

/** 2500 → "RM 25", 1250 → "RM 12.50". */
export function formatPrice(sen: number): string {
  const ringgit = sen / 100
  return `RM ${Number.isInteger(ringgit) ? ringgit : ringgit.toFixed(2)}`
}

/** 2500 → "25", 1250 → "12.50", for form inputs. */
export function senToInput(sen: number): string {
  const ringgit = sen / 100
  return Number.isInteger(ringgit) ? String(ringgit) : ringgit.toFixed(2)
}

/** "12.5", "RM 12.50", "12" → sen. Returns null for anything that isn't a positive amount. */
export function parseRinggit(input: string): number | null {
  const text = input
    .trim()
    .replace(/^rm\s*/i, "")
    .replace(/,/g, "")
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(text)) return null
  const sen = Math.round(Number(text) * 100)
  return sen > 0 ? sen : null
}

/** The lowest price, for "from RM 11" on items with options. */
export function lowestPrice(item: Pick<MenuItem, "prices">): number {
  return Math.min(...item.prices.map((price) => price.amount))
}

/** "RM 25", "from RM 11", or "RM 12 / RM 14" for hot/cold. */
export function priceSummary(prices: MenuPrice[]): string {
  if (prices.length === 0) return "No price"
  if (prices.length === 1) return formatPrice(prices[0].amount)
  return `from ${formatPrice(Math.min(...prices.map((p) => p.amount)))}`
}

export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

/* ---------------------------------------------------------------- assemble */

export type CategoryRow = {
  id: string
  slug: string
  name: string
  kind: MenuCategory["kind"]
  availability: string
  image: StoredImage | null
  isVisible: boolean
  sortOrder: number
}
export type GroupRow = {
  id: string
  categoryId: string
  name: string
  note: string | null
  columns: string[]
  sortOrder: number
}
export type ItemRow = {
  id: string
  groupId: string
  slug: string
  name: string
  description: string | null
  optionsLabel: string | null
  choices: { label: string; values: string[] } | null
  image: StoredImage | null
  isBestSeller: boolean
  isAvailable: boolean
  signatureOrder: number | null
  sortOrder: number
}
export type PriceRow = {
  itemId: string
  label: string
  amount: number
  sortOrder: number
}
export type AddOnRow = {
  categoryId: string
  label: string
  amount: number
  sortOrder: number
}

const bySort = <T extends { sortOrder: number }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder

function groupBy<T, K>(rows: T[], key: (row: T) => K) {
  const map = new Map<K, T[]>()
  for (const row of rows) {
    const list = map.get(key(row))
    if (list) list.push(row)
    else map.set(key(row), [row])
  }
  return map
}

const toImage = (image: StoredImage | null): MenuImage | undefined =>
  image ? { ...image } : undefined

/**
 * Builds the public menu from table rows: hidden categories, unavailable dishes,
 * dishes without a price, and groups left empty are all dropped.
 */
export function assembleMenu(rows: {
  categories: CategoryRow[]
  groups: GroupRow[]
  items: ItemRow[]
  prices: PriceRow[]
  addOns: AddOnRow[]
}): MenuCategory[] {
  const groupsByCategory = groupBy(rows.groups, (g) => g.categoryId)
  const itemsByGroup = groupBy(rows.items, (i) => i.groupId)
  const pricesByItem = groupBy(rows.prices, (p) => p.itemId)
  const addOnsByCategory = groupBy(rows.addOns, (a) => a.categoryId)

  return rows.categories
    .filter((c) => c.isVisible)
    .sort(bySort)
    .map((category) => {
      const groups = (groupsByCategory.get(category.id) ?? [])
        .sort(bySort)
        .map((group) => ({
          name: group.name,
          note: group.note ?? undefined,
          columns: group.columns.length ? group.columns : undefined,
          items: (itemsByGroup.get(group.id) ?? [])
            .filter((item) => item.isAvailable)
            .sort(bySort)
            .map((item): MenuItem => ({
              slug: item.slug,
              name: item.name,
              description: item.description ?? undefined,
              optionsLabel: item.optionsLabel ?? undefined,
              choices: item.choices?.values.length ? item.choices : undefined,
              bestSeller: item.isBestSeller,
              image: toImage(item.image),
              prices: (pricesByItem.get(item.id) ?? [])
                .sort(bySort)
                .map((p) => ({ label: p.label, amount: p.amount })),
            }))
            .filter((item) => item.prices.length > 0),
        }))
        .filter((group) => group.items.length > 0)

      return {
        slug: category.slug,
        name: category.name,
        kind: category.kind,
        availability: category.availability,
        image: toImage(category.image),
        groups,
        addOns: (addOnsByCategory.get(category.id) ?? [])
          .sort(bySort)
          .map((a) => ({ label: a.label, amount: a.amount })),
      }
    })
    .filter((category) => category.groups.length > 0)
}
