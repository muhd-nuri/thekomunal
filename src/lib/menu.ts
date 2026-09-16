// Komunal: the only way pages read the menu. Reads Postgres (edited in /admin/menu);
// CMS saves call revalidatePath("/") and revalidatePath("/menu").
import "server-only"
import { asc, eq, isNotNull } from "drizzle-orm"

import { db, schema } from "@/db"
import {
  menuUpdatedNote,
  priceNote,
  type MenuCategory,
  type MenuGroup,
  type MenuImage,
  type MenuItem,
  type MenuPdf,
  type MenuPrice,
} from "@/data/menu"
import type { MenuPdfSetting } from "@/db/schema"
import { assembleMenu } from "@/lib/menu-format"

export type { MenuCategory, MenuGroup, MenuImage, MenuItem, MenuPdf, MenuPrice }
export { formatPrice, lowestPrice, priceSummary } from "@/lib/menu-format"

/** Notes printed with the prices (tax, changes). */
export const menuNotes = { price: priceNote, updated: menuUpdatedNote } as const
export type SignatureDish = MenuItem & { image: MenuImage; category: string }

export const SIGNATURE_LIMIT = 8
export const MENU_PDF_KEY = "menu_pdf"

export async function getMenu(): Promise<MenuCategory[]> {
  const [categories, groups, items, prices, addOns] = await Promise.all([
    db.select().from(schema.menuCategories),
    db.select().from(schema.menuGroups),
    db.select().from(schema.menuItems),
    db.select().from(schema.menuItemPrices),
    db.select().from(schema.menuCategoryAddOns),
  ])
  // A build against an empty database would prerender a blank menu and homepage.
  if (
    categories.length === 0 &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    throw new Error(
      "The menu tables are empty. Run `bun run db:migrate && bun run db:seed` before building."
    )
  }
  return assembleMenu({ categories, groups, items, prices, addOns })
}

/** The homepage spread: dishes with a signature slot, a photo, and at least one price. */
export async function getSignatureDishes(): Promise<SignatureDish[]> {
  const rows = await db
    .select({
      item: schema.menuItems,
      category: schema.menuCategories.name,
      categoryVisible: schema.menuCategories.isVisible,
    })
    .from(schema.menuItems)
    .innerJoin(
      schema.menuGroups,
      eq(schema.menuItems.groupId, schema.menuGroups.id)
    )
    .innerJoin(
      schema.menuCategories,
      eq(schema.menuGroups.categoryId, schema.menuCategories.id)
    )
    .where(isNotNull(schema.menuItems.signatureOrder))
    .orderBy(asc(schema.menuItems.signatureOrder))

  const eligible = rows.filter(
    (row) => row.item.isAvailable && row.categoryVisible && row.item.image
  )
  const prices = eligible.length
    ? await db.select().from(schema.menuItemPrices)
    : []

  return eligible
    .map(({ item, category }): SignatureDish => ({
      slug: item.slug,
      name: item.name,
      description: item.description ?? undefined,
      optionsLabel: item.optionsLabel ?? undefined,
      bestSeller: item.isBestSeller,
      image: item.image!,
      category,
      prices: prices
        .filter((p) => p.itemId === item.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((p) => ({ label: p.label, amount: p.amount })),
    }))
    .filter((dish) => dish.prices.length > 0)
    .slice(0, SIGNATURE_LIMIT)
}

export async function getMenuPdfSetting(): Promise<MenuPdfSetting | undefined> {
  const row = await db.query.siteSettings.findFirst({
    where: eq(schema.siteSettings.key, MENU_PDF_KEY),
  })
  return row?.value as MenuPdfSetting | undefined
}

export async function getMenuPdf(
  outletSlug: string
): Promise<MenuPdf | undefined> {
  const pdf = await getMenuPdfSetting()
  return pdf?.src ? { outletSlug, label: pdf.label, href: pdf.src } : undefined
}
