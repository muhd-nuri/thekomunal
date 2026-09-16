// Komunal: one reservation — who, when, where they came from, and the actions staff need.
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Mail, Phone } from "lucide-react"

import { AdminPage } from "@/components/admin/admin-page"
import {
  ResendTelegramButton,
  StatusSelect,
} from "@/components/admin/reservation-controls"
import { StatusBadge } from "@/components/admin/status-badge"
import { WhatsAppIcon } from "@/components/brand/social-icons"
import { buttonVariants } from "@/components/ui/button"
import { getOutlet } from "@/data/outlets"
import { eventTypeLabel } from "@/data/reservation"
import { formatDateTime, formatDay } from "@/lib/admin/format"
import { requireAdmin } from "@/lib/admin/guard"
import { getReservation } from "@/lib/admin/reservations"
import {
  channelLabels,
  type SourceChannel,
  type Touch,
} from "@/lib/attribution"
import { formatTimeLabel } from "@/lib/booking-time"
import { formatMyMobile } from "@/lib/phone"
import { whatsappUrlFor } from "@/lib/reservation-notify"

export const metadata: Metadata = { title: "Reservation" }

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAdmin(`/admin/reservations/${id}`)
  const row = await getReservation(id)
  if (!row) notFound()

  const outlet = getOutlet(row.outletSlug)
  const firstTouch = row.firstTouch as Touch | null

  const lastTouch: [string, string | null | undefined][] = [
    [
      "Channel",
      channelLabels[row.sourceChannel as SourceChannel] ?? row.sourceChannel,
    ],
    ["Detail", row.sourceDetail],
    ["Ref code", row.refCode],
    ["utm_source", row.utmSource],
    ["utm_medium", row.utmMedium],
    ["utm_campaign", row.utmCampaign],
    ["utm_content", row.utmContent],
    ["utm_term", row.utmTerm],
    ["Ad click", row.clickIdType ? `${row.clickIdType}: ${row.clickId}` : null],
    ["Referrer", row.referrerUrl],
    ["Landed on", row.landingPath],
    ["Booked from", row.submitPath],
  ]

  const firstTouchRows: [string, string | undefined][] = firstTouch
    ? [
        ["Ref code", firstTouch.ref],
        ["utm_source", firstTouch.utm_source],
        ["utm_medium", firstTouch.utm_medium],
        ["utm_campaign", firstTouch.utm_campaign],
        ["utm_content", firstTouch.utm_content],
        ["utm_term", firstTouch.utm_term],
        ["fbclid", firstTouch.fbclid],
        ["gclid", firstTouch.gclid],
        ["ttclid", firstTouch.ttclid],
        ["Referrer", firstTouch.referrer],
        ["Landed on", firstTouch.landing],
        [
          "First visit",
          firstTouch.ts ? formatDateTime(new Date(firstTouch.ts)) : undefined,
        ],
      ]
    : []

  return (
    <AdminPage
      title={`${row.name}`}
      description={
        <>
          {row.code} · requested {formatDateTime(row.createdAt)}
        </>
      }
      action={
        <Link
          href="/admin/reservations"
          className={buttonVariants({ variant: "ghost" })}
        >
          <ArrowLeft data-icon="inline-start" />
          All reservations
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg">Booking</h2>
            <StatusBadge status={row.status} />
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Item label="Visit">
              {formatDay(row.reservedDate)}, {formatTimeLabel(row.reservedTime)}
            </Item>
            <Item label="Guests">{row.guests} pax</Item>
            <Item label="Occasion">
              {row.eventType ? eventTypeLabel(row.eventType) : "—"}
            </Item>
            <Item label="Outlet">{outlet?.shortName ?? row.outletSlug}</Item>
            <Item label="Company">{row.company || "—"}</Item>
            <Item label="Contacted">
              {row.contactedAt ? formatDateTime(row.contactedAt) : "Not yet"}
            </Item>
          </dl>
          {row.notes ? (
            <div className="mt-4 rounded-lg bg-muted p-3">
              <p className="text-xs font-extrabold text-muted-foreground uppercase">
                Guest notes
              </p>
              <p className="mt-1 whitespace-pre-wrap">{row.notes}</p>
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-4 rounded-xl border bg-card p-5">
          <h2 className="text-lg">Contact</h2>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href={`tel:+${row.phoneE164}`}
              className="flex items-center gap-2 underline-offset-4 hover:underline"
            >
              <Phone className="size-4 text-brand" />
              {formatMyMobile(row.phoneE164)}
            </a>
            <a
              href={`mailto:${row.email}`}
              className="flex items-center gap-2 break-all underline-offset-4 hover:underline"
            >
              <Mail className="size-4 shrink-0 text-brand" />
              {row.email}
            </a>
          </div>
          <a
            href={whatsappUrlFor(row)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              className: "bg-[#128c4a] hover:bg-[#0f7a40]",
            })}
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp {row.name.split(" ")[0]}
          </a>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-extrabold">Status</span>
            <StatusSelect
              id={row.id}
              status={row.status}
              label="Reservation status"
            />
          </div>
          <div className="border-t pt-4">
            <p className="text-sm">
              Telegram:{" "}
              <span className="font-extrabold">
                {row.telegramStatus === "sent"
                  ? "sent"
                  : row.telegramStatus === "failed"
                    ? "failed"
                    : "pending"}
              </span>
            </p>
            {row.telegramError ? (
              <p className="mt-1 text-xs break-words text-destructive">
                {row.telegramError}
              </p>
            ) : null}
            <div className="mt-3">
              <ResendTelegramButton id={row.id} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 lg:col-span-3">
          <h2 className="text-lg">Where they came from</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-extrabold text-muted-foreground uppercase">
                Last touch (credited)
              </h3>
              <Attribution rows={lastTouch} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-muted-foreground uppercase">
                First touch
              </h3>
              {firstTouchRows.length ? (
                <Attribution rows={firstTouchRows} />
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Not recorded.
                </p>
              )}
            </div>
          </div>
          <p className="mt-4 text-xs break-words text-muted-foreground">
            Device: {row.userAgent ?? "unknown"}
          </p>
        </section>
      </div>
    </AdminPage>
  )
}

function Item({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-xs font-extrabold text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}

function Attribution({
  rows,
}: {
  rows: [string, string | null | undefined][]
}) {
  const shown = rows.filter(([, value]) => value)
  if (!shown.length)
    return (
      <p className="mt-2 text-sm text-muted-foreground">Nothing recorded.</p>
    )
  return (
    <dl className="mt-2 grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1.5 text-sm">
      {shown.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="break-all">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
