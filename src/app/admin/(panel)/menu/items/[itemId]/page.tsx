// Komunal: edit one dish (or add one with /admin/menu/items/new?group=…).
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { AdminPage } from "@/components/admin/admin-page"
import {
  ItemForm,
  type ItemFormValues,
} from "@/components/admin/menu/item-form"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/guard"
import {
  getGroupWithCategory,
  getItemWithPrices,
  listGroupOptions,
} from "@/lib/admin/menu-admin"

export const metadata: Metadata = { title: "Dish" }

export default async function ItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ itemId: string }>
  searchParams: Promise<{ group?: string }>
}) {
  const { itemId } = await params
  const { group: groupParam } = await searchParams
  await requireAdmin(`/admin/menu/items/${itemId}`)

  const isNew = itemId === "new"
  const item = isNew ? undefined : await getItemWithPrices(itemId)
  if (!isNew && !item) notFound()

  const groupRow = await getGroupWithCategory(item?.groupId ?? groupParam ?? "")
  if (!groupRow) notFound()
  const groups = await listGroupOptions()

  const values: ItemFormValues = item
    ? {
        ...item,
        categoryId: groupRow.category.id,
        prices: item.prices.map((p) => ({ label: p.label, amount: p.amount })),
      }
    : {
        groupId: groupRow.group.id,
        categoryId: groupRow.category.id,
        name: "",
        slug: "",
        description: null,
        optionsLabel: null,
        choices: null,
        image: null,
        isBestSeller: false,
        isAvailable: true,
        signatureOrder: null,
        prices: [],
      }

  return (
    <AdminPage
      title={item ? item.name : "New dish"}
      description={`${groupRow.category.name}${groupRow.group.name !== groupRow.category.name ? ` › ${groupRow.group.name}` : ""}`}
      action={
        <Link
          href={`/admin/menu/${groupRow.category.id}`}
          className={buttonVariants({ variant: "ghost" })}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to {groupRow.category.name}
        </Link>
      }
    >
      <ItemForm item={values} groups={groups} />
    </AdminPage>
  )
}
