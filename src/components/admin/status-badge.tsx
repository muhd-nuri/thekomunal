// Komunal: reservation status and Telegram delivery as small coloured pills.
import { cn } from "@/lib/utils"
import {
  statusLabels,
  type ReservationStatus,
} from "@/lib/admin/reservation-labels"

const statusClass: Record<ReservationStatus, string> = {
  new: "bg-brand text-white",
  contacted: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-muted text-muted-foreground line-through",
  no_show: "bg-red-100 text-red-900",
}

export function StatusBadge({
  status,
  className,
}: {
  status: ReservationStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-extrabold whitespace-nowrap",
        statusClass[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}

export function TelegramBadge({
  status,
}: {
  status: "pending" | "sent" | "failed"
}) {
  if (status === "sent") return null
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-[0.6875rem] font-extrabold whitespace-nowrap",
        status === "failed"
          ? "bg-red-100 text-red-900"
          : "bg-muted text-muted-foreground"
      )}
    >
      {status === "failed" ? "Telegram failed" : "Telegram pending"}
    </span>
  )
}
