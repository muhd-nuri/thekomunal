import { describe, expect, test } from "bun:test"
import {
  formatPrice,
  getMenu,
  getSignatureDishes,
  lowestPrice,
} from "@/lib/menu"

describe("menu data", () => {
  test("category and item slugs are unique, since /menu uses both as element IDs", async () => {
    const menu = await getMenu()
    const ids = [
      ...menu.map((c) => c.slug),
      ...menu.flatMap((c) =>
        c.groups.flatMap((g) => g.items.map((i) => i.slug))
      ),
      "best-sellers",
    ]
    expect(new Set(ids).size).toBe(ids.length)
  })

  test("every item has at least one positive whole-sen price", async () => {
    for (const category of await getMenu())
      for (const group of category.groups)
        for (const item of group.items) {
          expect(item.prices.length).toBeGreaterThan(0)
          for (const price of item.prices) {
            expect(Number.isInteger(price.amount)).toBe(true)
            expect(price.amount).toBeGreaterThan(0)
          }
        }
  })

  test("column groups only use their declared columns", async () => {
    for (const category of await getMenu())
      for (const group of category.groups)
        if (group.columns)
          for (const item of group.items)
            for (const price of item.prices)
              expect(group.columns).toContain(price.label)
  })

  test("signature dishes are eight best sellers with photos", async () => {
    const dishes = await getSignatureDishes()
    expect(dishes).toHaveLength(8)
    for (const dish of dishes) {
      expect(dish.bestSeller).toBe(true)
      expect(dish.image.src).toStartWith("/images/menu/")
    }
  })
})

describe("formatPrice", () => {
  test("whole and fractional ringgit", () => {
    expect(formatPrice(2500)).toBe("RM 25")
    expect(formatPrice(1250)).toBe("RM 12.50")
  })
  test("lowestPrice", async () => {
    const nasi = (await getSignatureDishes()).find(
      (d) => d.slug === "nasi-lemak-pandan"
    )!
    expect(lowestPrice(nasi)).toBe(1100)
  })
})
