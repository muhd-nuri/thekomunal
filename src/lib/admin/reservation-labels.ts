// Komunal: reservation status values and labels, safe to import from client components.
export const statusValues = [
  "new",
  "contacted",
  "confirmed",
  "cancelled",
  "no_show",
] as const
export type ReservationStatus = (typeof statusValues)[number]

export const statusLabels: Record<ReservationStatus, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  no_show: "No-show",
}

export const statusHelp: Record<ReservationStatus, string> = {
  new: "Not contacted yet",
  contacted: "WhatsApped, waiting for the guest",
  confirmed: "Table is locked in",
  cancelled: "Guest or team cancelled",
  no_show: "Guest didn't turn up",
}
