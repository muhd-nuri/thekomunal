// Komunal: reservations list — GET filter form, table, pagination and CSV export.
import type { Metadata } from "next"
import Link from "next/link"
import { Download, Search } from "lucide-react"

import { AdminPage } from "@/components/admin/admin-page"
import { StatusSelect } from "@/components/admin/reservation-controls"
import { TelegramBadge } from "@/components/admin/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { eventTypeLabel } from "@/data/reservation"
import { formatDay, timeAgo } from "@/lib/admin/format"
import { requireAdmin } from "@/lib/admin/guard"
import {
  channelValues,
  filtersToSearch,
  listReservations,
  parseFilters,
  PAGE_SIZE,
  statusLabels,
  statusValues,
} from "@/lib/admin/reservations"
import { channelLabels, type SourceChannel } from "@/lib/attribution"
import { formatTimeLabel } from "@/lib/booking-time"
import { formatMyMobile } from "@/lib/phone"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Reservations" }

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const filters = parseFilters(params)
  await requireAdmin(`/admin/reservations${filtersToSearch(filters)}`)
  const { rows, total, pageCount } = await listReservations(filters)
  const hasFilters = filtersToSearch({ ...filters, page: 1 }) !== ""
  const first = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1
  const last = Math.min(filters.page * PAGE_SIZE, total)

  return (
    <AdminPage
      title="Reservations"
      description="Every table request from the website. Change a status as soon as you WhatsApp the guest."
      action={
        <a
          href={`/admin/reservations/export${filtersToSearch({ ...filters, page: 1 })}`}
          className={buttonVariants({ variant: "outline" })}
        >
          <Download data-icon="inline-start" />
          Export CSV
        </a>
      }
    >
      <form
        method="get"
        className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="q">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              name="q"
              defaultValue={filters.q}
              placeholder="Name, phone, email or KM- code"
              className="h-9 pl-8"
            />
          </div>
        </div>
        <Field label="Status" htmlFor="status">
          <NativeSelect
            id="status"
            name="status"
            defaultValue={filters.status ?? ""}
            className="w-full"
          >
            <NativeSelectOption value="">All statuses</NativeSelectOption>
            {statusValues.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {statusLabels[value]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Channel" htmlFor="channel">
          <NativeSelect
            id="channel"
            name="channel"
            defaultValue={filters.channel ?? ""}
            className="w-full"
          >
            <NativeSelectOption value="">All channels</NativeSelectOption>
            {channelValues.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {channelLabels[value]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Ref code" htmlFor="ref">
          <Input
            id="ref"
            name="ref"
            defaultValue={filters.ref}
            placeholder="e.g. agency-x"
            className="h-9"
          />
        </Field>
        <Field label="Sort" htmlFor="sort">
          <NativeSelect
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className="w-full"
          >
            <NativeSelectOption value="reserved_desc">
              Visit date, latest first
            </NativeSelectOption>
            <NativeSelectOption value="reserved_asc">
              Visit date, soonest first
            </NativeSelectOption>
            <NativeSelectOption value="created_desc">
              Newest requests first
            </NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field label="Date applies to" htmlFor="date">
          <NativeSelect
            id="date"
            name="date"
            defaultValue={filters.dateField}
            className="w-full"
          >
            <NativeSelectOption value="reserved">Visit date</NativeSelectOption>
            <NativeSelectOption value="created">
              Request date
            </NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field label="From" htmlFor="from">
          <Input
            id="from"
            name="from"
            type="date"
            defaultValue={filters.from}
            className="h-9"
          />
        </Field>
        <Field label="To" htmlFor="to">
          <Input
            id="to"
            name="to"
            type="date"
            defaultValue={filters.to}
            className="h-9"
          />
        </Field>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2 lg:justify-end">
          {hasFilters ? (
            <Link
              href="/admin/reservations"
              className={buttonVariants({ variant: "ghost" })}
            >
              Clear
            </Link>
          ) : null}
          <Button type="submit">Apply filters</Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {total === 0
          ? "No reservations match."
          : `Showing ${first}–${last} of ${total}`}
      </p>

      {rows.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-3 md:hidden">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/admin/reservations/${row.id}`}
                  className="min-w-0 underline-offset-4 hover:underline"
                >
                  <span className="block font-extrabold">{row.name}</span>
                  <span className="block text-sm text-brand">
                    {formatDay(row.reservedDate)},{" "}
                    {formatTimeLabel(row.reservedTime)}
                  </span>
                </Link>
                <span className="shrink-0 text-sm tabular-nums">
                  {row.guests} pax
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {row.code} · {formatMyMobile(row.phoneE164)}
                {row.eventType ? ` · ${eventTypeLabel(row.eventType)}` : ""}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <TelegramBadge status={row.telegramStatus} />
                <StatusSelect
                  id={row.id}
                  status={row.status}
                  size="sm"
                  label={`Status for ${row.code}`}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {rows.length > 0 ? (
        <div className="mt-3 hidden overflow-hidden rounded-xl border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visit</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead className="text-right">Pax</TableHead>
                <TableHead className="hidden md:table-cell">Occasion</TableHead>
                <TableHead className="hidden lg:table-cell">Source</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="align-top whitespace-nowrap">
                    <Link
                      href={`/admin/reservations/${row.id}`}
                      className="font-extrabold text-brand underline-offset-4 hover:underline"
                    >
                      {formatDay(row.reservedDate)}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeLabel(row.reservedTime)} · {row.code}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="font-extrabold">{row.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatMyMobile(row.phoneE164)}
                      {row.company ? ` · ${row.company}` : ""}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <TelegramBadge status={row.telegramStatus} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right align-top tabular-nums">
                    {row.guests}
                  </TableCell>
                  <TableCell className="hidden align-top md:table-cell">
                    {row.eventType ? eventTypeLabel(row.eventType) : "—"}
                  </TableCell>
                  <TableCell className="hidden align-top lg:table-cell">
                    <div>
                      {channelLabels[row.sourceChannel as SourceChannel] ??
                        row.sourceChannel}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.refCode ? `ref ${row.refCode} · ` : ""}
                      {timeAgo(row.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <StatusSelect
                      id={row.id}
                      status={row.status}
                      size="sm"
                      label={`Status for ${row.code}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {pageCount > 1 ? (
        <nav
          aria-label="Pagination"
          className="mt-4 flex items-center justify-between gap-2"
        >
          <PageLink
            disabled={filters.page <= 1}
            href={`/admin/reservations${filtersToSearch(filters, { page: filters.page - 1 })}`}
          >
            Previous
          </PageLink>
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {pageCount}
          </span>
          <PageLink
            disabled={filters.page >= pageCount}
            href={`/admin/reservations${filtersToSearch(filters, { page: filters.page + 1 })}`}
          >
            Next
          </PageLink>
        </nav>
      ) : null}
    </AdminPage>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string
  disabled: boolean
  children: React.ReactNode
}) {
  if (disabled)
    return (
      <span
        className={cn(
          buttonVariants({ variant: "outline" }),
          "pointer-events-none opacity-50"
        )}
        aria-disabled="true"
      >
        {children}
      </span>
    )
  return (
    <Link href={href} className={buttonVariants({ variant: "outline" })}>
      {children}
    </Link>
  )
}
