"use client"
// Komunal: client pieces of /admin/menu — new section form, PDF form, homepage list controls.
import { FileText } from "lucide-react"

import {
  createCategory,
  moveCategory,
  moveSignature,
  removeSignature,
  saveMenuPdf,
  setCategoryVisible,
} from "@/app/admin/(panel)/menu/actions"
import {
  Field,
  InstantSwitch,
  MoveButtons,
  SubmitButton,
  useAdminForm,
} from "@/components/admin/form-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { MenuPdfSetting } from "@/db/schema"

export function NewCategoryForm() {
  const { state, pending, formProps } = useAdminForm(createCategory)
  return (
    <form {...formProps} className="flex flex-wrap items-end gap-3">
      <Field
        label="New section"
        htmlFor="new-category-name"
        error={state.fieldErrors?.name}
      >
        <Input
          id="new-category-name"
          name="name"
          placeholder="e.g. Ramadan specials"
          className="w-56"
          required
        />
      </Field>
      <Field label="Type" htmlFor="new-category-kind">
        <NativeSelect id="new-category-kind" name="kind" defaultValue="food">
          <NativeSelectOption value="food">Food</NativeSelectOption>
          <NativeSelectOption value="drinks">Drinks</NativeSelectOption>
          <NativeSelectOption value="extras">Add-ons</NativeSelectOption>
        </NativeSelect>
      </Field>
      <SubmitButton pending={pending} pendingLabel="Adding…">
        Add section
      </SubmitButton>
    </form>
  )
}

export function CategoryRowControls({
  id,
  name,
  isVisible,
  isFirst,
  isLast,
}: {
  id: string
  name: string
  isVisible: boolean
  isFirst: boolean
  isLast: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <InstantSwitch
          checked={isVisible}
          label={`Show ${name} on the website`}
          onChange={(next) => setCategoryVisible(id, next)}
          successMessage={(next) =>
            `${name} is ${next ? "visible" : "hidden"} on the website.`
          }
        />
        <span className="hidden sm:inline">
          {isVisible ? "Visible" : "Hidden"}
        </span>
      </label>
      <MoveButtons
        label={name}
        isFirst={isFirst}
        isLast={isLast}
        onMove={(direction) => moveCategory(id, direction)}
      />
    </div>
  )
}

export function SignatureRowControls({
  id,
  name,
  isFirst,
  isLast,
}: {
  id: string
  name: string
  isFirst: boolean
  isLast: boolean
}) {
  return (
    <div className="flex items-center">
      <MoveButtons
        label={name}
        isFirst={isFirst}
        isLast={isLast}
        onMove={(direction) => moveSignature(id, direction)}
      />
      <form action={removeSignature.bind(null, id)}>
        <Button type="submit" variant="ghost" size="sm">
          Remove
        </Button>
      </form>
    </div>
  )
}

export function MenuPdfForm({ current }: { current?: MenuPdfSetting }) {
  const { pending, formProps } = useAdminForm(saveMenuPdf, {
    resetOnSuccess: true,
  })
  const size = current?.bytes
    ? `${(current.bytes / 1024 / 1024).toFixed(1)} MB`
    : null
  return (
    <form {...formProps} className="flex flex-col gap-4">
      {current ? (
        <a
          href={current.src}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-extrabold text-brand underline-offset-4 hover:underline"
        >
          <FileText className="size-4 shrink-0" />
          <span className="truncate">{current.filename}</span>
          {size ? (
            <span className="font-medium text-muted-foreground">({size})</span>
          ) : null}
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">No PDF yet.</p>
      )}
      {current && !current.src.startsWith("/media/") ? (
        <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
          This still points at the old WordPress site. Upload the PDF here so
          the link keeps working after the switch.
        </p>
      ) : null}
      <Field label="Button text" htmlFor="pdf-label">
        <Input
          id="pdf-label"
          name="label"
          defaultValue={current?.label ?? "Full menu (PDF)"}
          maxLength={60}
        />
      </Field>
      <Field
        label="Replace with a new PDF"
        htmlFor="pdf-file"
        hint="PDF only, up to 40 MB. Export a web-sized copy if you can."
      >
        <Input id="pdf-file" name="file" type="file" accept="application/pdf" />
      </Field>
      <div>
        <SubmitButton pending={pending} pendingLabel="Uploading…">
          Save
        </SubmitButton>
      </div>
    </form>
  )
}
