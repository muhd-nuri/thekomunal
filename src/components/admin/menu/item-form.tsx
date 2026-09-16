"use client"
// Komunal: dish editor — details, prices (single, options, or per column), photo, flags.
import { useActionState, useState } from "react"
import { Plus, X } from "lucide-react"

import { deleteItem, saveItem } from "@/app/admin/(panel)/menu/actions"
import {
  ConfirmDelete,
  Field,
  SubmitButton,
  useResultToast,
} from "@/components/admin/form-kit"
import { ImageField } from "@/components/admin/image-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { StoredImage } from "@/db/schema"
import type { FormState } from "@/lib/admin/form"
import { senToInput } from "@/lib/menu-format"

type GroupOption = { id: string; label: string; columns: string[] }
type PriceRow = { key: number; label: string; amount: string }

export type ItemFormValues = {
  id?: string
  groupId: string
  categoryId: string
  name: string
  slug: string
  description: string | null
  optionsLabel: string | null
  choices: { label: string; values: string[] } | null
  image: StoredImage | null
  isBestSeller: boolean
  isAvailable: boolean
  signatureOrder: number | null
  prices: { label: string; amount: number }[]
}

const initial: FormState = {}

export function ItemForm({
  item,
  groups,
}: {
  item: ItemFormValues
  groups: GroupOption[]
}) {
  const [state, action] = useActionState(saveItem, initial)
  useResultToast(state)
  const errors = state.fieldErrors ?? {}

  const [groupId, setGroupId] = useState(item.groupId)
  const columns = groups.find((g) => g.id === groupId)?.columns ?? []

  const [rows, setRows] = useState<PriceRow[]>(() =>
    item.prices.length
      ? item.prices.map((p, i) => ({
          key: i,
          label: p.label,
          amount: senToInput(p.amount),
        }))
      : [{ key: 0, label: "", amount: "" }]
  )
  const update = (key: number, patch: Partial<PriceRow>) =>
    setRows((current) =>
      current.map((r) => (r.key === key ? { ...r, ...patch } : r))
    )

  // In a column group, show one input per column and keep any existing values.
  const columnRows = columns.map((column) => ({
    column,
    amount: rows.find((r) => r.label === column)?.amount ?? "",
  }))
  const setColumnAmount = (column: string, amount: string) =>
    setRows((current) => {
      const exists = current.some((r) => r.label === column)
      return exists
        ? current.map((r) => (r.label === column ? { ...r, amount } : r))
        : [...current, { key: Date.now(), label: column, amount }]
    })

  const pricesJson = JSON.stringify(
    columns.length
      ? columnRows.map((r) => ({ label: r.column, amount: r.amount }))
      : rows.map(({ label, amount }) => ({ label, amount }))
  )
  const multiple = !columns.length && rows.length > 1

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {item.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <input type="hidden" name="prices" value={pricesJson} />

      <div className="flex flex-col gap-6">
        <section className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2 md:p-6">
          <Field label="Dish name" htmlFor="name" error={errors.name}>
            <Input
              id="name"
              name="name"
              defaultValue={item.name}
              required
              maxLength={100}
            />
          </Field>
          <Field label="Section" htmlFor="groupId" error={errors.groupId}>
            <NativeSelect
              id="groupId"
              name="groupId"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full"
            >
              {groups.map((g) => (
                <NativeSelectOption key={g.id} value={g.id}>
                  {g.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label="Description"
            htmlFor="description"
            className="md:col-span-2"
            hint="Ingredients, the way the menu lists them."
          >
            <Textarea
              id="description"
              name="description"
              defaultValue={item.description ?? ""}
              rows={3}
              maxLength={600}
            />
          </Field>
          <Field
            label="Web address"
            htmlFor="slug"
            hint="Leave empty to make one from the name."
          >
            <Input
              id="slug"
              name="slug"
              defaultValue={item.slug}
              maxLength={80}
            />
          </Field>
        </section>

        <section className="rounded-xl border bg-card p-4 md:p-6">
          <h2 className="text-lg">Price</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            In ringgit, before SST.{" "}
            {columns.length
              ? `This group is priced by ${columns.join(" / ")}. Leave one empty if it isn't offered.`
              : "Add rows for options like protein or flavour, and name each one."}
          </p>

          {columns.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {columnRows.map((r) => (
                <Field
                  key={r.column}
                  label={r.column}
                  htmlFor={`price-${r.column}`}
                >
                  <MoneyInput
                    id={`price-${r.column}`}
                    value={r.amount}
                    onChange={(value) => setColumnAmount(r.column, value)}
                  />
                </Field>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {multiple ? (
                <Field
                  label="What the options are"
                  htmlFor="optionsLabel"
                  hint='e.g. "Protein" or "Flavour"'
                >
                  <Input
                    id="optionsLabel"
                    name="optionsLabel"
                    defaultValue={item.optionsLabel ?? ""}
                    maxLength={40}
                    className="max-w-xs"
                  />
                </Field>
              ) : null}
              {rows.map((row, i) => (
                <div key={row.key} className="flex items-center gap-2">
                  {multiple ? (
                    <Input
                      aria-label={`Option ${i + 1} name`}
                      value={row.label}
                      onChange={(e) =>
                        update(row.key, { label: e.target.value })
                      }
                      placeholder="Option name"
                      maxLength={60}
                    />
                  ) : null}
                  <MoneyInput
                    aria-label={multiple ? `Option ${i + 1} price` : "Price"}
                    value={row.amount}
                    onChange={(value) => update(row.key, { amount: value })}
                  />
                  {multiple ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove option ${i + 1}`}
                      onClick={() =>
                        setRows((current) => {
                          const next = current.filter((r) => r.key !== row.key)
                          // Back to a single price: its label no longer applies.
                          return next.length === 1
                            ? [{ ...next[0], label: "" }]
                            : next
                        })
                      }
                    >
                      <X />
                    </Button>
                  ) : null}
                </div>
              ))}
              <div>
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
                  {multiple ? "Add option" : "Add options (e.g. protein)"}
                </Button>
              </div>
            </div>
          )}
          {errors.prices ? (
            <p className="mt-3 text-sm font-extrabold text-destructive">
              {errors.prices}
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[12rem_1fr] md:p-6">
          <div className="md:col-span-2">
            <h2 className="text-lg">Free choices</h2>
            <p className="text-sm text-muted-foreground">
              Choices that don&apos;t change the price, like egg style.
              Optional.
            </p>
          </div>
          <Field label="Label" htmlFor="choiceLabel">
            <Input
              id="choiceLabel"
              name="choiceLabel"
              defaultValue={item.choices?.label ?? ""}
              placeholder="Eggs"
              maxLength={40}
            />
          </Field>
          <Field label="Choices, separated by commas" htmlFor="choiceValues">
            <Input
              id="choiceValues"
              name="choiceValues"
              defaultValue={item.choices?.values.join(", ") ?? ""}
              placeholder="Scrambled, Omelette, Sunny side up"
              maxLength={300}
            />
          </Field>
        </section>
      </div>

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-xl border bg-card p-4">
          <Toggle
            name="isAvailable"
            defaultChecked={item.isAvailable}
            title="Available"
            help="Off hides it from the menu (sold out)."
          />
          <Toggle
            name="isBestSeller"
            defaultChecked={item.isBestSeller}
            title="Best seller"
            help="Shows a Best seller tag."
          />
          <Toggle
            name="onHomepage"
            defaultChecked={item.signatureOrder !== null}
            title={
              item.signatureOrder
                ? `On the homepage (#${item.signatureOrder})`
                : "Show on the homepage"
            }
            help="Up to 8 dishes. Needs a photo."
          />
        </section>

        <section className="rounded-xl border bg-card p-4">
          <ImageField
            name="image"
            label="Photo"
            defaultImage={item.image}
            error={errors.image}
            altError={errors.imageAlt}
            hint="Square photos look best."
          />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <SubmitButton className="h-10 px-5">
            {item.id ? "Save dish" : "Add dish"}
          </SubmitButton>
          {item.id ? (
            <ConfirmDelete
              label="Delete dish"
              title={`Delete ${item.name}?`}
              description="The dish and its photo are removed from the menu. This can't be undone."
              onConfirm={() =>
                deleteItem(item.id!, `/admin/menu/${item.categoryId}`)
              }
            />
          ) : null}
        </div>
      </div>
    </form>
  )
}

function MoneyInput({
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative w-32 shrink-0">
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
        RM
      </span>
      <Input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        placeholder="0.00"
        className="pl-9"
      />
    </div>
  )
}

function Toggle({
  name,
  defaultChecked,
  title,
  help,
}: {
  name: string
  defaultChecked: boolean
  title: string
  help: string
}) {
  return (
    <label className="flex items-start gap-3">
      <Switch name={name} defaultChecked={defaultChecked} className="mt-1" />
      <span className="text-sm">
        <span className="block font-extrabold">{title}</span>
        <span className="block text-muted-foreground">{help}</span>
      </span>
    </label>
  )
}
