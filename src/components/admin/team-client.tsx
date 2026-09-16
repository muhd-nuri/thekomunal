"use client"
// Komunal: team and settings forms.
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, Wand2 } from "lucide-react"
import { toast } from "sonner"

import {
  addTeamMember,
  changeOwnPassword,
  removeTeamMember,
  resetTeamPassword,
  updateOwnName,
} from "@/app/admin/(panel)/team/actions"
import {
  ConfirmDelete,
  Field,
  SubmitButton,
  useAdminForm,
} from "@/components/admin/form-kit"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

/** 16 characters from an unambiguous alphabet. */
function generatePassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = crypto.getRandomValues(new Uint32Array(16))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")
}

function PasswordInput({
  id,
  name,
  error,
}: {
  id: string
  name: string
  error?: string
}) {
  const [value, setValue] = useState("")
  return (
    <div className="flex gap-2">
      <Input
        id={id}
        name={name}
        type="text"
        autoComplete="new-password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={error ? true : undefined}
        className="font-mono"
        required
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => setValue(generatePassword())}
      >
        <Wand2 data-icon="inline-start" />
        Generate
      </Button>
    </div>
  )
}

export function AddMemberForm() {
  const {
    errors: e,
    pending,
    formProps,
  } = useAdminForm(addTeamMember, {
    resetOnSuccess: true,
  })
  return (
    <form {...formProps} className="grid gap-4 md:grid-cols-3 md:items-start">
      <Field label="Name" htmlFor="tm-name" error={e.name}>
        <Input id="tm-name" name="name" required maxLength={80} />
      </Field>
      <Field label="Email" htmlFor="tm-email" error={e.email}>
        <Input
          id="tm-email"
          name="email"
          type="email"
          required
          autoComplete="off"
        />
      </Field>
      <Field
        label="Temporary password"
        htmlFor="tm-password"
        error={e.password}
        hint="Send it to them privately; they can change it in Settings."
      >
        <PasswordInput id="tm-password" name="password" error={e.password} />
      </Field>
      <div className="md:col-span-3">
        <SubmitButton pending={pending} pendingLabel="Adding…">
          Add to team
        </SubmitButton>
      </div>
    </form>
  )
}

export function MemberActions({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const reset = useAdminForm(resetTeamPassword)
  const [, start] = useTransition()
  return (
    <div className="flex items-center gap-1">
      <Dialog>
        <DialogTrigger render={<Button variant="ghost" size="sm" />}>
          <KeyRound data-icon="inline-start" />
          Reset password
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New password for {name}</DialogTitle>
            <DialogDescription>
              They&apos;ll be signed out everywhere and need this password to
              sign back in.
            </DialogDescription>
          </DialogHeader>
          <form {...reset.formProps} className="flex flex-col gap-4">
            <input type="hidden" name="userId" value={id} />
            <Field
              label="New password"
              htmlFor={`reset-${id}`}
              error={reset.errors.password}
            >
              <PasswordInput id={`reset-${id}`} name="password" />
            </Field>
            <SubmitButton pending={reset.pending}>Set password</SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDelete
        size="sm"
        label="Remove"
        title={`Remove ${name}?`}
        description="They'll be signed out and can't sign in again. Their past edits stay."
        onConfirm={() =>
          new Promise<void>((resolve) =>
            start(async () => {
              const result = await removeTeamMember(id)
              if (result.ok) toast.success(`${name} removed.`)
              else toast.error(result.error)
              router.refresh()
              resolve()
            })
          )
        }
      />
    </div>
  )
}

export function OwnNameForm({ name }: { name: string }) {
  const { errors, pending, formProps } = useAdminForm(updateOwnName)
  return (
    <form {...formProps} className="flex flex-wrap items-end gap-3">
      <Field label="Your name" htmlFor="own-name" error={errors.name}>
        <Input
          id="own-name"
          name="name"
          defaultValue={name}
          required
          maxLength={80}
          className="w-64"
        />
      </Field>
      <SubmitButton pending={pending} variant="outline">
        Save name
      </SubmitButton>
    </form>
  )
}

export function ChangePasswordForm() {
  const {
    errors: e,
    pending,
    formProps,
  } = useAdminForm(changeOwnPassword, {
    resetOnSuccess: true,
  })
  return (
    <form {...formProps} className="grid max-w-md gap-4">
      <Field
        label="Current password"
        htmlFor="pw-current"
        error={e.currentPassword}
      >
        <Input
          id="pw-current"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field
        label="New password"
        htmlFor="pw-new"
        error={e.newPassword}
        hint="At least 12 characters. A short sentence works well."
      >
        <Input
          id="pw-new"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
        />
      </Field>
      <Field
        label="New password again"
        htmlFor="pw-confirm"
        error={e.confirmPassword}
      >
        <Input
          id="pw-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <div>
        <SubmitButton pending={pending} pendingLabel="Changing…">
          Change password
        </SubmitButton>
      </div>
    </form>
  )
}
