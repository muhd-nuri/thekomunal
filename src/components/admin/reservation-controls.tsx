"use client"
// Komunal: status picker + resend button for one reservation.
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { toast } from "sonner"

import {
  resendToTelegram,
  updateReservationStatus,
} from "@/app/admin/(panel)/reservations/actions"
import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  statusHelp,
  statusLabels,
  statusValues,
  type ReservationStatus,
} from "@/lib/admin/reservation-labels"

export function StatusSelect({
  id,
  status,
  size = "default",
  label,
}: {
  id: string
  status: ReservationStatus
  size?: "sm" | "default"
  label: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <NativeSelect
      size={size}
      aria-label={label}
      value={status}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value as ReservationStatus
        start(async () => {
          const result = await updateReservationStatus(id, next)
          if (result.ok) toast.success(result.message)
          else toast.error(result.error)
          router.refresh()
        })
      }}
    >
      {statusValues.map((value) => (
        <NativeSelectOption key={value} value={value} title={statusHelp[value]}>
          {statusLabels[value]}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

export function ResendTelegramButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const result = await resendToTelegram(id)
          if (result.ok) toast.success(result.message)
          else toast.error(result.error)
          router.refresh()
        })
      }
    >
      <Send data-icon="inline-start" />
      {pending ? "Sending…" : "Resend to Telegram"}
    </Button>
  )
}
