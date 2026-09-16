import { describe, expect, test } from "bun:test"

import { menuCategories, signatureDishSlugs } from "@/data/menu"
import {
  assembleMenu,
  formatPrice,
  lowestPrice,
  parseRinggit,
  priceSummary,
  slugify,
  type CategoryRow,
  type GroupRow,
  type ItemRow,
} from "@/lib/menu-format"

describe("seed menu (src/data/menu.ts)", () => {
  const items = menuCategories.flatMap((c) => c.groups.flatMap((g) => g.items))

  test("category and item slugs are unique, since /menu uses both as element IDs", () => {
    const ids = [
      ...menuCategories.map((c) => c.slug),
      ...items.map((i) => i.slug),
      "best-sellers",
    ]
    expect(new Set(ids).size).toBe(ids.length)
  })

  test("every item has at least one positive whole-sen price", () => {
    for (const item of items) {
      expect(item.prices.length).toBeGreaterThan(0)
      for (const price of item.prices) {
        expect(Number.isInteger(price.amount)).toBe(true)
        expect(price.amount).toBeGreaterThan(0)
      }
    }
  })

  test("column groups only use their declared columns", () => {
    for (const category of menuCategories)
      for (const group of category.groups)
        if (group.columns)
          for (const item of group.items)
            for (const price of item.prices)
              expect(group.columns).toContain(price.label)
  })

  test("signature dishes are best sellers with photos", () => {
    expect(signatureDishSlugs).toHaveLength(8)
    for (const slug of signatureDishSlugs) {
      const dish = items.find((i) => i.slug === slug)
      expect(dish?.bestSeller).toBe(true)
      expect(dish?.image?.src).toStartWith("/images/menu/")
    }
  })
})

describe("price helpers", () => {
  test("formatPrice", () => {
    expect(formatPrice(2500)).toBe("RM 25")
    expect(formatPrice(1250)).toBe("RM 12.50")
  })
  test("parseRinggit accepts common inputs and rejects the rest", () => {
    expect(parseRinggit("12")).toBe(1200)
    expect(parseRinggit("12.5")).toBe(1250)
    expect(parseRinggit(" RM 12.50 ")).toBe(1250)
    expect(parseRinggit("1,200")).toBe(120000)
    expect(parseRinggit("0")).toBeNull()
    expect(parseRinggit("-3")).toBeNull()
    expect(parseRinggit("12.555")).toBeNull()
    expect(parseRinggit("abc")).toBeNull()
  })
  test("lowestPrice and priceSummary", () => {
    const prices = [
      { label: "A", amount: 2500 },
      { label: "B", amount: 1100 },
    ]
    expect(lowestPrice({ prices })).toBe(1100)
    expect(priceSummary(prices)).toBe("from RM 11")
    expect(priceSummary([{ label: "", amount: 900 }])).toBe("RM 9")
  })
  test("slugify", () => {
    expect(slugify("Fish & Chips")).toBe("fish-and-chips")
    expect(slugify("  Rosé Pasta! ")).toBe("rose-pasta")
  })
})

describe("assembleMenu", () => {
  const category = (
    id: string,
    sortOrder: number,
    isVisible = true
  ): CategoryRow => ({
    id,
    slug: id,
    name: id.toUpperCase(),
    kind: "food",
    availability: "All day",
    image: null,
    isVisible,
    sortOrder,
  })
  const group = (id: string, categoryId: string): GroupRow => ({
    id,
    categoryId,
    name: "G",
    note: null,
    columns: [],
    sortOrder: 0,
  })
  const item = (
    id: string,
    groupId: string,
    sortOrder: number,
    isAvailable = true
  ): ItemRow => ({
    id,
    groupId,
    slug: id,
    name: id,
    description: null,
    optionsLabel: null,
    choices: null,
    image: null,
    isBestSeller: false,
    isAvailable,
    signatureOrder: null,
    sortOrder,
  })

  test("sorts, and drops hidden categories, unavailable or unpriced items, and empty groups", () => {
    const menu = assembleMenu({
      categories: [
        category("b", 2),
        category("a", 1),
        category("hidden", 0, false),
        category("empty", 3),
      ],
      groups: [
        group("ga", "a"),
        group("gb", "b"),
        group("gh", "hidden"),
        group("ge", "empty"),
      ],
      items: [
        item("a2", "ga", 2),
        item("a1", "ga", 1),
        item("sold-out", "ga", 3, false),
        item("no-price", "ga", 4),
        item("b1", "gb", 1),
        item("h1", "gh", 1),
        item("e1", "ge", 1, false),
      ],
      prices: [
        { itemId: "a1", label: "", amount: 100, sortOrder: 0 },
        { itemId: "a2", label: "Cold", amount: 300, sortOrder: 1 },
        { itemId: "a2", label: "Hot", amount: 200, sortOrder: 0 },
        { itemId: "sold-out", label: "", amount: 100, sortOrder: 0 },
        { itemId: "b1", label: "", amount: 100, sortOrder: 0 },
        { itemId: "h1", label: "", amount: 100, sortOrder: 0 },
        { itemId: "e1", label: "", amount: 100, sortOrder: 0 },
      ],
      addOns: [{ categoryId: "a", label: "Egg", amount: 200, sortOrder: 0 }],
    })
    expect(menu.map((c) => c.slug)).toEqual(["a", "b"])
    expect(menu[0].groups[0].items.map((i) => i.slug)).toEqual(["a1", "a2"])
    expect(menu[0].groups[0].items[1].prices.map((p) => p.label)).toEqual([
      "Hot",
      "Cold",
    ])
    expect(menu[0].addOns).toEqual([{ label: "Egg", amount: 200 }])
  })
})
