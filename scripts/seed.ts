// Komunal: seeds the database. Run with `bun run db:seed` after `bun run db:migrate`.
//
// - Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD if that account is missing.
// - Loads the menu (src/data/menu.ts) and events (src/data/events.ts) only when those
//   tables are empty, so re-running never overwrites what the team edited in the CMS.
import { count } from "drizzle-orm"

import { db, schema } from "@/db"
import { events as seedEvents } from "@/data/events"
import {
  menuCategories as seedCategories,
  menuPdfs,
  signatureDishSlugs,
} from "@/data/menu"
import { createStaffUser, MIN_PASSWORD_LENGTH } from "@/lib/auth"

const SEED_BY = "seed"

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD ?? ""
  if (!email) {
    console.log("admin: ADMIN_EMAIL not set, skipped")
    return
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`
    )
  }
  const result = await createStaffUser({
    name: process.env.ADMIN_NAME || "Komunal Admin",
    email,
    password,
  })
  console.log(
    result.ok ? `admin: created ${email}` : `admin: ${email} already exists`
  )
}

async function isEmpty(table: typeof schema.menuCategories | typeof schema.events) {
  const [row] = await db.select({ n: count() }).from(table)
  return row.n === 0
}

async function seedMenu() {
  if (!(await isEmpty(schema.menuCategories))) {
    console.log("menu: already has categories, skipped")
    return
  }
  let items = 0
  await db.transaction(async (tx) => {
    for (const [ci, category] of seedCategories.entries()) {
      const [cat] = await tx
        .insert(schema.menuCategories)
        .values({
          slug: category.slug,
          name: category.name,
          kind: category.kind,
          availability: category.availability,
          image: category.image ?? null,
          sortOrder: ci,
          updatedBy: SEED_BY,
        })
        .returning({ id: schema.menuCategories.id })

      if (category.addOns?.length) {
        await tx.insert(schema.menuCategoryAddOns).values(
          category.addOns.map((addOn, i) => ({
            categoryId: cat.id,
            label: addOn.label,
            amount: addOn.amount,
            sortOrder: i,
          }))
        )
      }

      for (const [gi, group] of category.groups.entries()) {
        const [grp] = await tx
          .insert(schema.menuGroups)
          .values({
            categoryId: cat.id,
            name: group.name,
            note: group.note ?? null,
            columns: group.columns ?? [],
            sortOrder: gi,
            updatedBy: SEED_BY,
          })
          .returning({ id: schema.menuGroups.id })

        for (const [ii, item] of group.items.entries()) {
          const signature = signatureDishSlugs.indexOf(
            item.slug as (typeof signatureDishSlugs)[number]
          )
          const [row] = await tx
            .insert(schema.menuItems)
            .values({
              groupId: grp.id,
              slug: item.slug,
              name: item.name,
              description: item.description ?? null,
              optionsLabel: item.optionsLabel ?? null,
              choices: item.choices ?? null,
              image: item.image ?? null,
              isBestSeller: item.bestSeller ?? false,
              signatureOrder: signature >= 0 ? signature + 1 : null,
              sortOrder: ii,
              updatedBy: SEED_BY,
            })
            .returning({ id: schema.menuItems.id })
          await tx.insert(schema.menuItemPrices).values(
            item.prices.map((price, pi) => ({
              itemId: row.id,
              label: price.label,
              amount: price.amount,
              sortOrder: pi,
            }))
          )
          items++
        }
      }
    }
  })
  console.log(`menu: ${seedCategories.length} categories, ${items} items`)
}

async function seedMenuPdf() {
  const existing = await db.query.siteSettings.findFirst({
    where: (s, { eq }) => eq(s.key, "menu_pdf"),
  })
  if (existing) {
    console.log("menu pdf: already set, skipped")
    return
  }
  const pdf = menuPdfs[0]
  if (!pdf) return
  const value: schema.MenuPdfSetting = {
    src: pdf.href,
    label: pdf.label,
    filename: "The-Komunal-Menu-2.pdf",
    bytes: 0,
  }
  await db
    .insert(schema.siteSettings)
    .values({ key: "menu_pdf", value, updatedBy: SEED_BY })
  console.log("menu pdf: linked to the current WordPress file")
}

async function seedEvents_() {
  if (!(await isEmpty(schema.events))) {
    console.log("events: already has rows, skipped")
    return
  }
  await db.transaction(async (tx) => {
    for (const [i, event] of seedEvents.entries()) {
      const [row] = await tx
        .insert(schema.events)
        .values({
          slug: event.slug,
          name: event.name,
          period: event.period,
          tagline: event.tagline,
          description: event.description,
          venue: event.venue,
          venueNote: event.venueNote ?? "",
          isFeatured: i === 0,
          sortOrder: i,
          updatedBy: SEED_BY,
        })
        .returning({ id: schema.events.id })
      await tx.insert(schema.eventPosters).values(
        event.posters.map((poster, pi) => ({
          eventId: row.id,
          image: {
            src: poster.src,
            alt: poster.alt,
            width: poster.width,
            height: poster.height,
          },
          tilt: poster.tilt,
          sortOrder: pi,
        }))
      )
    }
  })
  console.log(`events: ${seedEvents.length} seeded`)
}

await seedAdmin()
await seedMenu()
await seedMenuPdf()
await seedEvents_()
process.exit(0)
