// Komunal: the only way pages read the menu. Phase 4 swaps the static data for Postgres here,
// so keep these signatures async and keep callers away from `@/data/menu`.
import {
  menuCategories,
  menuPdfs,
  signatureDishSlugs,
  type MenuCategory,
  type MenuImage,
  type MenuItem,
  type MenuPdf,
  type MenuPrice,
} from "@/data/menu"

export type { MenuCategory, MenuImage, MenuItem, MenuPdf, MenuPrice }
export type SignatureDish = MenuItem & { image: MenuImage; category: string }

export async function getMenu(): Promise<MenuCategory[]> {
  return menuCategories
}

export async function getSignatureDishes(): Promise<SignatureDish[]> {
  const items = menuCategories.flatMap((category) =>
    category.groups.flatMap((group) =>
      group.items.map((item) => ({ ...item, category: category.name }))
    )
  )
  return signatureDishSlugs.map((slug) => {
    const item = items.find((candidate) => candidate.slug === slug)
    if (!item?.image)
      throw new Error(`Signature dish "${slug}" is missing or has no photo`)
    return { ...item, image: item.image }
  })
}

export async function getMenuPdf(
  outletSlug: string
): Promise<MenuPdf | undefined> {
  return menuPdfs.find((pdf) => pdf.outletSlug === outletSlug)
}

/** 2500 → "RM 25", 1250 → "RM 12.50". */
export function formatPrice(sen: number): string {
  const ringgit = sen / 100
  return `RM ${Number.isInteger(ringgit) ? ringgit : ringgit.toFixed(2)}`
}

/** The lowest price, for "from RM 11" on items with options. */
export function lowestPrice(item: MenuItem): number {
  return Math.min(...item.prices.map((price) => price.amount))
}
