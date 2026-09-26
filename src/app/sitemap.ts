// Komunal: sitemap.xml — the public pages. lastModified comes from the CMS tables where a
// page is built from them; pages with no dated content leave it out rather than guess.
import type { MetadataRoute } from "next"
import { eq, max } from "drizzle-orm"

import { db, schema } from "@/db"
import { privacyMeta } from "@/data/privacy"
import { MENU_PDF_KEY } from "@/lib/menu"
import { SITE_URL } from "@/lib/seo"

// CMS edits revalidate their pages, not this file; an hourly refresh keeps dates honest.
export const revalidate = 3600

async function latest(
  ...queries: Promise<{ at: Date | null }[]>[]
): Promise<Date | undefined> {
  try {
    const rows = await Promise.all(queries)
    const times = rows
      .flat()
      .map((r) => r.at?.getTime())
      .filter((t): t is number => typeof t === "number")
    return times.length ? new Date(Math.max(...times)) : undefined
  } catch (error) {
    console.error("[sitemap] could not read content dates", error)
    return undefined
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { menuCategories, menuGroups, menuItems, events, siteSettings } = schema
  const [menu, community] = await Promise.all([
    latest(
      db.select({ at: max(menuCategories.updatedAt) }).from(menuCategories),
      db.select({ at: max(menuGroups.updatedAt) }).from(menuGroups),
      db.select({ at: max(menuItems.updatedAt) }).from(menuItems),
      db
        .select({ at: max(siteSettings.updatedAt) })
        .from(siteSettings)
        .where(eq(siteSettings.key, MENU_PDF_KEY))
    ),
    latest(db.select({ at: max(events.updatedAt) }).from(events)),
  ])
  const home = [menu, community]
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => b.getTime() - a.getTime())[0]
  const privacy = new Date(`${privacyMeta.effectiveDate} UTC`)

  const entry = (path: string, lastModified?: Date) => ({
    url: `${SITE_URL}${path}`,
    ...(lastModified && !Number.isNaN(lastModified.getTime())
      ? { lastModified }
      : {}),
  })

  return [
    entry("/", home),
    entry("/menu", menu),
    entry("/visit"),
    entry("/community", community),
    entry("/reserve"),
    entry("/privacy", privacy),
  ]
}
