// Komunal: one menu section — its details, groups, dishes and add-ons.
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Home, Pencil, Plus, Star } from "lucide-react"

import { AdminPage } from "@/components/admin/admin-page"
import {
  AddOnsForm,
  CategoryForm,
  GroupForm,
  ItemRowControls,
  NewGroupForm,
} from "@/components/admin/menu/category-client"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/guard"
import { getCategoryTree } from "@/lib/admin/menu-admin"
import { formatPrice, priceSummary } from "@/lib/menu-format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Menu section" }

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>
  searchParams: Promise<{ created?: string; saved?: string }>
}) {
  const { categoryId } = await params
  const { created, saved } = await searchParams
  await requireAdmin(`/admin/menu/${categoryId}`)
  const tree = await getCategoryTree(categoryId)
  if (!tree) notFound()
  const { category, groups, addOns } = tree

  return (
    <AdminPage
      title={category.name}
      description={
        category.isVisible
          ? "Visible on the website."
          : "Hidden from the website. Switch on “Show on the website” when it's ready."
      }
      action={
        <Link
          href="/admin/menu"
          className={buttonVariants({ variant: "ghost" })}
        >
          <ArrowLeft data-icon="inline-start" />
          All sections
        </Link>
      }
    >
      {created ? (
        <p
          role="status"
          className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          Section created. Add dishes, then switch it on.
        </p>
      ) : null}
      {saved ? (
        <p
          role="status"
          className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {saved} added.
        </p>
      ) : null}

      <section className="rounded-xl border bg-card p-4 md:p-6">
        <h2 className="mb-4 text-lg">Section details</h2>
        <CategoryForm category={category} />
      </section>

      <div className="mt-6 flex flex-col gap-6">
        {groups.map((group, gi) => (
          <section key={group.id} className="rounded-xl border bg-card">
            <div className="border-b p-4">
              <GroupForm
                group={group}
                isFirst={gi === 0}
                isLast={gi === groups.length - 1}
                itemCount={group.items.length}
              />
            </div>
            {group.items.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No dishes in this group yet.
              </p>
            ) : (
              <ul className="divide-y">
                {group.items.map((item, ii) => (
                  <li
                    key={item.id}
                    id={`item-${item.id}`}
                    className={cn(
                      "flex scroll-mt-20 flex-wrap items-center gap-3 p-3 sm:flex-nowrap",
                      !item.isAvailable && "bg-muted/50"
                    )}
                  >
                    <Link
                      href={`/admin/menu/items/${item.id}`}
                      className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 hover:bg-muted/60"
                    >
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.image ? (
                          <Image
                            src={item.image.src}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-x-2 font-extrabold">
                          <span
                            className={cn(
                              !item.isAvailable &&
                                "text-muted-foreground line-through"
                            )}
                          >
                            {item.name}
                          </span>
                          {item.isBestSeller ? (
                            <Star
                              className="size-3.5 fill-current text-brand"
                              aria-label="Best seller"
                            />
                          ) : null}
                          {item.signatureOrder ? (
                            <Home
                              className="size-3.5 text-brand"
                              aria-label={`On the homepage, #${item.signatureOrder}`}
                            />
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {group.columns.length
                            ? item.prices
                                .map(
                                  (p) => `${p.label} ${formatPrice(p.amount)}`
                                )
                                .join(" · ")
                            : priceSummary(item.prices)}
                          {item.description ? ` · ${item.description}` : ""}
                        </p>
                      </div>
                      <Pencil className="ml-auto size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    </Link>
                    <ItemRowControls
                      id={item.id}
                      name={item.name}
                      isAvailable={item.isAvailable}
                      isFirst={ii === 0}
                      isLast={ii === group.items.length - 1}
                    />
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t p-3">
              <Link
                href={`/admin/menu/items/new?group=${group.id}`}
                className={buttonVariants({ variant: "outline" })}
              >
                <Plus data-icon="inline-start" />
                Add a dish to {group.name}
              </Link>
            </div>
          </section>
        ))}

        <section className="rounded-xl border bg-card p-4">
          <NewGroupForm categoryId={category.id} />
        </section>

        <section className="rounded-xl border bg-card p-4">
          <h2 className="text-lg">Section add-ons</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Extras listed under this section, like “Add streaky beef +RM 4”.
          </p>
          <AddOnsForm categoryId={category.id} addOns={addOns} />
        </section>
      </div>
    </AdminPage>
  )
}
