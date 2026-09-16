"use client"
// Komunal: shared admin form pieces — field wrapper, submit button, result toasts,
// confirm-before-delete, reorder arrows and instant toggles.
import { useEffect, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { FormState } from "@/lib/admin/form"
import { cn } from "@/lib/utils"

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: React.ReactNode
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs font-extrabold text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className,
  variant,
}: {
  children: React.ReactNode
  pendingLabel?: string
  className?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className={className}
      variant={variant}
    >
      {pending ? pendingLabel : children}
    </Button>
  )
}

/** Toasts the result of a useActionState form each time it changes. */
export function useResultToast(state: FormState) {
  useEffect(() => {
    if (!state.at) return
    if (state.ok && state.message) toast.success(state.message)
    else if (!state.ok && state.error) toast.error(state.error)
  }, [state])
}

export function ConfirmDelete({
  title,
  description,
  onConfirm,
  label = "Delete",
  size = "default",
}: {
  title: string
  description: string
  onConfirm: () => Promise<unknown>
  label?: string
  size?: "default" | "sm" | "icon-sm"
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size={size}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={size === "icon-sm" ? `${label}: ${title}` : undefined}
          />
        }
      >
        <Trash2 data-icon={size === "icon-sm" ? undefined : "inline-start"} />
        {size === "icon-sm" ? null : label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await onConfirm()
                router.refresh()
              })
            }
          >
            {pending ? "Deleting…" : label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function MoveButtons({
  label,
  onMove,
  isFirst,
  isLast,
}: {
  label: string
  onMove: (direction: "up" | "down") => Promise<unknown>
  isFirst: boolean
  isLast: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const move = (direction: "up" | "down") =>
    start(async () => {
      await onMove(direction)
      router.refresh()
    })
  return (
    <div className="flex">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={pending || isFirst}
        onClick={() => move("up")}
        aria-label={`Move ${label} up`}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={pending || isLast}
        onClick={() => move("down")}
        aria-label={`Move ${label} down`}
      >
        <ArrowDown />
      </Button>
    </div>
  )
}

export function InstantSwitch({
  checked,
  label,
  onChange,
  successMessage,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => Promise<unknown>
  successMessage: (checked: boolean) => string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Switch
      checked={checked}
      disabled={pending}
      aria-label={label}
      onCheckedChange={(next) =>
        start(async () => {
          await onChange(next)
          toast.success(successMessage(next))
          router.refresh()
        })
      }
    />
  )
}
