// Komunal: CSV export of the reservations matching the list filters.
import { eventTypeLabel } from "@/data/reservation"
import { toCsv } from "@/lib/admin/csv"
import { formatDateTime } from "@/lib/admin/format"
import { getAdminSession } from "@/lib/admin/guard"
import {
  exportReservations,
  parseFilters,
  statusLabels,
} from "@/lib/admin/reservations"
import { channelLabels, type SourceChannel } from "@/lib/attribution"
import { klToday } from "@/lib/booking-time"
import { formatMyMobile } from "@/lib/phone"

export async function GET(request: Request) {
  if (!(await getAdminSession()))
    return new Response("Not signed in", { status: 401 })

  const params = Object.fromEntries(new URL(request.url).searchParams)
  const rows = await exportReservations(parseFilters(params))

  const csv = toCsv(
    [
      "Code",
      "Status",
      "Visit date",
      "Visit time",
      "Guests",
      "Occasion",
      "Name",
      "Phone",
      "Email",
      "Company",
      "Notes",
      "Outlet",
      "Channel",
      "Channel detail",
      "Ref code",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "Click ID type",
      "Landing page",
      "Referrer",
      "Requested at (MYT)",
      "Contacted at (MYT)",
      "Telegram",
    ],
    rows.map((r) => [
      r.code,
      statusLabels[r.status],
      r.reservedDate,
      r.reservedTime,
      r.guests,
      r.eventType ? eventTypeLabel(r.eventType) : "",
      r.name,
      formatMyMobile(r.phoneE164),
      r.email,
      r.company,
      r.notes,
      r.outletSlug,
      channelLabels[r.sourceChannel as SourceChannel] ?? r.sourceChannel,
      r.sourceDetail,
      r.refCode,
      r.utmSource,
      r.utmMedium,
      r.utmCampaign,
      r.utmContent,
      r.utmTerm,
      r.clickIdType,
      r.landingPath,
      r.referrerUrl,
      formatDateTime(r.createdAt),
      r.contactedAt ? formatDateTime(r.contactedAt) : "",
      r.telegramStatus,
    ])
  )

  // BOM so Excel opens UTF-8 names correctly.
  return new Response(`﻿${csv}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="komunal-reservations-${klToday()}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
