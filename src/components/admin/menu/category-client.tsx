"use client"
// Komunal: client pieces of the section editor — section form, group forms, add-ons, item row controls.
import { useState } from "react"
import { Plus, X } from "lucide-react"

import {
  createGroup,
  deleteCategory,
  deleteGroup,
  deleteItem,
  moveGroup,
  moveItem,
  saveAddOns,
  setItemAvailable,
  updateCategory,
  updateGroup,
} from "@/app/admin/(panel)/menu/actions"
import {
  ConfirmDelete,
  Field,
  InstantSwitch,
  MoveButtons,
  SubmitButton,
  useAdminForm,
} from "@/components/admin/form-kit"
import { ImageField } from "@/components/admin/image-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import type { StoredImage } from "@/db/schema"
import { senToInput } from "@/lib/menu-format"

export function CategoryForm({
  category,
}: {
  category: {
    id: string
    name: string
    slug: string
    kind: "food" | "drinks" | "extras"
    availability: string
    isVisible: boolean
    image: StoredImage | null
  }
}) {
  const { errors, pending, formProps } = useAdminForm(updateCategory)
  return (
    <form {...formProps} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={category.id} />
      <Field label="Section name" htmlFor="cat-name" error={errors.name}>
        <Input
          id="cat-name"
          name="name"
          defaultValue={category.name}
          required
          maxLength={80}
        />
      </Field>
      <Field
        label="Web address"
        htmlFor="cat-slug"
        hint={<>Used for /menu#{category.slug}. Letters, numbers and dashes.</>}
      >
        <Input
          id="cat-slug"
          name="slug"
          defaultValue={category.slug}
          maxLength={80}
        />
      </Field>
      <Field
        label="Type"
        htmlFor="cat-kind"
        hint="Drinks show on blue; add-ons show last."
      >
        <NativeSelect
          id="cat-kind"
          name="kind"
          defaultValue={category.kind}
          className="w-full"
        >
          <NativeSelectOption value="food">Food</NativeSelectOption>
          <NativeSelectOption value="drinks">Drinks</NativeSelectOption>
          <NativeSelectOption value="extras">Add-ons</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field
        label="When it's served"
        htmlFor="cat-availability"
        hint='e.g. "All day" or "8:30 to 11:00 AM". Leave empty to hide.'
      >
        <Input
          id="cat-availability"
          name="availability"
          defaultValue={category.availability}
          maxLength={60}
        />
      </Field>
      <label className="flex items-center gap-3 md:col-span-2">
        <Switch name="isVisible" defaultChecked={category.isVisible} />
        <span className="text-sm">
          <span className="font-extrabold">Show on the website</span>
          <span className="block text-muted-foreground">
            Turn off to work on a section before it goes live.
          </span>
        </span>
      </label>
      <div className="md:col-span-2">
        <ImageField
          name="image"
          label="Section photo"
          aspect="aspect-[4/5]"
          defaultImage={category.image}
          hint="Portrait works best. Shown beside the section on large screens."
          altError={errors.imageAlt}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 md:col-span-2">
        <SubmitButton pending={pending}>Save section</SubmitButton>
        <ConfirmDelete
          label="Delete section"
          title={`Delete ${category.name}?`}
          description="Every group and dish in this section is deleted too, with their photos. This can't be undone."
          onConfirm={() => deleteCategory(category.id)}
        />
      </div>
    </form>
  )
}

export function GroupForm({
  group,
  isFirst,
  isLast,
  itemCount,
}: {
  group: { id: string; name: string; note: string | null; columns: string[] }
  isFirst: boolean
  isLast: boolean
  itemCount: number
}) {
  const { errors, pending, formProps } = useAdminForm(updateGroup)
  return (
    <form
      {...formProps}
      className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
    >
      <input type="hidden" name="id" value={group.id} />
      <Field
        label="Group name"
        htmlFor={`g-name-${group.id}`}
        error={errors.name}
      >
        <Input
          id={`g-name-${group.id}`}
          name="name"
          defaultValue={group.name}
          required
          maxLength={80}
        />
      </Field>
      <Field label="Note" htmlFor={`g-note-${group.id}`}>
        <Input
          id={`g-note-${group.id}`}
          name="note"
          defaultValue={group.note ?? ""}
          placeholder="e.g. Served with fries."
          maxLength={200}
        />
      </Field>
      <Field
        label="Price columns"
        htmlFor={`g-cols-${group.id}`}
        hint="Optional, e.g. Hot, Cold"
      >
        <Input
          id={`g-cols-${group.id}`}
          name="columns"
          defaultValue={group.columns.join(", ")}
          maxLength={120}
        />
      </Field>
      <div className="flex items-center gap-1 md:pb-5">
        <SubmitButton pending={pending} variant="outline">
          Save
        </SubmitButton>
        <MoveButtons
          label={group.name}
          isFirst={isFirst}
          isLast={isLast}
          onMove={(d) => moveGroup(group.id, d)}
        />
        <ConfirmDelete
          size="icon-sm"
          label="Delete group"
          title={`Delete the group "${group.name}"?`}
          description={
            itemCount
              ? `Its ${itemCount} dish${itemCount === 1 ? "" : "es"} will be deleted too. This can't be undone.`
              : "The group is empty. This can't be undone."
          }
          onConfirm={() => deleteGroup(group.id)}
        />
      </div>
    </form>
  )
}

export function NewGroupForm({ categoryId }: { categoryId: string }) {
  const { errors, pending, formProps } = useAdminForm(createGroup, {
    resetOnSuccess: true,
  })
  return (
    <form {...formProps} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="categoryId" value={categoryId} />
      <Field
        label="Add a group"
        htmlFor="new-group"
        hint="Groups are sub-headings, like Coffee or Matcha."
        error={errors.name}
      >
        <Input
          id="new-group"
          name="name"
          placeholder="Group name"
          required
          className="w-56"
          maxLength={80}
        />
      </Field>
      <div className="pb-5">
        <SubmitButton
          pending={pending}
          variant="outline"
          pendingLabel="Adding…"
        >
          Add group
        </SubmitButton>
      </div>
    </form>
  )
}

export function ItemRowControls({
  id,
  name,
  isAvailable,
  isFirst,
  isLast,
}: {
  id: string
  name: string
  isAvailable: boolean
  isFirst: boolean
  isLast: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 text-xs">
        <InstantSwitch
          checked={isAvailable}
          label={`${name} available`}
          onChange={(next) => setItemAvailable(id, next)}
          successMessage={(next) =>
            `${name} is ${next ? "back on the menu" : "marked sold out"}.`
          }
        />
        <span className="hidden w-14 lg:inline">
          {isAvailable ? "Available" : "Sold out"}
        </span>
      </label>
      <MoveButtons
        label={name}
        isFirst={isFirst}
        isLast={isLast}
        onMove={(d) => moveItem(id, d)}
      />
      <ConfirmDelete
        size="icon-sm"
        label="Delete dish"
        title={`Delete ${name}?`}
        description="The dish and its photo are removed from the menu. This can't be undone."
        onConfirm={() => deleteItem(id)}
      />
    </div>
  )
}

type Row = { key: number; label: string; amount: string }

export function AddOnsForm({
  categoryId,
  addOns,
}: {
  categoryId: string
  addOns: { label: string; amount: number }[]
}) {
  const { pending, formProps } = useAdminForm(saveAddOns)
  const [rows, setRows] = useState<Row[]>(() =>
    addOns.map((a, i) => ({
      key: i,
      label: a.label,
      amount: senToInput(a.amount),
    }))
  )
  const update = (key: number, patch: Partial<Row>) =>
    setRows((current) =>
      current.map((r) => (r.key === key ? { ...r, ...patch } : r))
    )

  return (
    <form {...formProps} className="flex flex-col gap-3">
      <input type="hidden" name="categoryId" value={categoryId} />
      <input
        type="hidden"
        name="addOns"
        value={JSON.stringify(
          rows.map(({ label, amount }) => ({ label, amount }))
        )}
      />
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No add-ons for this section.
        </p>
      ) : null}
      {rows.map((row, i) => (
        <div key={row.key} className="flex items-center gap-2">
          <Input
            aria-label={`Add-on ${i + 1} name`}
            value={row.label}
            onChange={(e) => update(row.key, { label: e.target.value })}
            placeholder="e.g. Grilled Chicken Breast"
            maxLength={80}
          />
          <div className="relative w-28 shrink-0">
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
              RM
            </span>
            <Input
              aria-label={`Add-on ${i + 1} price in ringgit`}
              value={row.amount}
              onChange={(e) => update(row.key, { amount: e.target.value })}
              inputMode="decimal"
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove add-on ${i + 1}`}
            onClick={() =>
              setRows((current) => current.filter((r) => r.key !== row.key))
            }
          >
            <X />
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setRows((current) => [
              ...current,
              { key: Date.now(), label: "", amount: "" },
            ])
          }
        >
          <Plus data-icon="inline-start" />
          Add row
        </Button>
        <SubmitButton pending={pending}>Save add-ons</SubmitButton>
      </div>
    </form>
  )
}
