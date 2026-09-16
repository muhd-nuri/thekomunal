// Komunal: menu CMS home — sections in order, the homepage spread, and the PDF.
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, EyeOff } from "lucide-react"

import { AdminPage } from "@/components/admin/admin-page"
import {
  CategoryRowControls,
  MenuPdfForm,
  NewCategoryForm,
  SignatureRowControls,
} from "@/components/admin/menu/menu-overview-client"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/guard"
import {
  listCategoriesWithCounts,
  listSignatureItems,
} from "@/lib/admin/menu-admin"
import { getMenuPdfSetting, SIGNATURE_LIMIT } from "@/lib/menu"

export const metadata: Metadata = { title: "Menu" }

const kindLabel = { food: "Food", drinks: "Drinks", extras: "Add-ons" } as const

export default async function MenuAdminPage() {
  await requireAdmin("/admin/menu")
  const [categories, signature, pdf] = await Promise.all([
    listCategoriesWithCounts(),
    listSignatureItems(),
    getMenuPdfSetting(),
  ])

  return (
    <AdminPage
      title="Menu"
      description="Edit sections, dishes and prices. Changes appear on the website as soon as you save."
      action={
        <a
          href="/menu"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline" })}
        >
          View menu page
        </a>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <section className="rounded-xl border bg-card">
          <div className="border-b p-4">
            <h2 className="text-lg">Sections</h2>
            <p className="text-sm text-muted-foreground">
              In the order they appear on the menu page. Hidden sections stay in
              the admin only.
            </p>
          </div>
          <ul className="divide-y">
            {categories.map((category, index) => (
              <li
                key={category.id}
                className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap"
              >
                <Link
                  href={`/admin/menu/${category.id}`}
                  className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 hover:bg-muted/60"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {category.image ? (
                      <Image
                        src={category.image.src}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-extrabold">
                      <span className="truncate">{category.name}</span>
                      {!category.isVisible ? (
                        <EyeOff
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-label="Hidden"
                        />
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {kindLabel[category.kind]} · {category.itemCount} items
                      {category.availability
                        ? ` · ${category.availability}`
                        : ""}
                    </p>
                  </div>
                  <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                </Link>
                <CategoryRowControls
                  id={category.id}
                  name={category.name}
                  isVisible={category.isVisible}
                  isFirst={index === 0}
                  isLast={index === categories.length - 1}
                />
              </li>
            ))}
          </ul>
          <div className="border-t p-4">
            <NewCategoryForm />
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-xl border bg-card p-4">
            <h2 className="text-lg">Homepage dishes</h2>
            <p className="text-sm text-muted-foreground">
              Up to {SIGNATURE_LIMIT}, in this order. Add one from a dish&apos;s
              edit page.
            </p>
            {signature.length === 0 ? (
              <p className="mt-3 text-sm">
                None yet. The homepage hides the section until you add one.
              </p>
            ) : (
              <ol className="mt-3 flex flex-col gap-1">
                {signature.map((dish, index) => {
                  const hidden =
                    !dish.isAvailable || !dish.categoryVisible || !dish.image
                  return (
                    <li key={dish.id} className="flex items-center gap-2">
                      <span className="w-5 text-right text-xs font-extrabold text-brand tabular-nums">
                        {index + 1}
                      </span>
                      <div className="relative size-9 shrink-0 overflow-hidden rounded bg-muted">
                        {dish.image ? (
                          <Image
                            src={dish.image.src}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <Link
                        href={`/admin/menu/items/${dish.id}`}
                        className="min-w-0 flex-1 text-sm underline-offset-4 hover:underline"
                      >
                        <span className="block truncate font-extrabold">
                          {dish.name}
                        </span>
                        {hidden ? (
                          <span className="block text-xs text-destructive">
                            Not shown:{" "}
                            {!dish.image
                              ? "no photo"
                              : !dish.isAvailable
                                ? "sold out"
                                : "section hidden"}
                          </span>
                        ) : (
                          <span className="block truncate text-xs text-muted-foreground">
                            {dish.category}
                          </span>
                        )}
                      </Link>
                      <SignatureRowControls
                        id={dish.id}
                        name={dish.name}
                        isFirst={index === 0}
                        isLast={index === signature.length - 1}
                      />
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 text-lg">Menu PDF</h2>
            <MenuPdfForm current={pdf} />
          </section>
        </div>
      </div>
    </AdminPage>
  )
}
