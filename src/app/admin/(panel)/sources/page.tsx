// Komunal: which channels and partner ref codes bring bookings, for a date range.
import type { Metadata } from "next"
import Link from "next/link"

import { AdminPage } from "@/components/admin/admin-page"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireAdmin } from "@/lib/admin/guard"
import {
  filtersToSearch,
  parseFilters,
  sourcesReport,
} from "@/lib/admin/reservations"
import { channelLabels, type SourceChannel } from "@/lib/attribution"
import { klDateOffset, klToday } from "@/lib/booking-time"

export const metadata: Metadata = { title: "Sources" }

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin("/admin/sources")
  const params = await searchParams
  const parsed = parseFilters(params)
  // Default window: the last 30 days of requests.
  const filters = {
    ...parsed,
    from: parsed.from ?? klDateOffset(-29),
    to: parsed.to ?? klToday(),
    dateField:
      params.date === "reserved" ? ("reserved" as const) : ("created" as const),
  }
  const { byChannel, byRef, totals } = await sourcesReport(filters)
  const listLink = (extra: Record<string, string>) =>
    `/admin/reservations${filtersToSearch(
      {
        from: filters.from,
        to: filters.to,
        dateField: filters.dateField,
        sort: "created_desc",
      },
      extra
    )}`

  return (
    <AdminPage
      title="Sources"
      description="Bookings and guests by channel and by partner ref code. A booking is credited to the last way the guest arrived."
    >
      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Count by</Label>
          <NativeSelect id="date" name="date" defaultValue={filters.dateField}>
            <NativeSelectOption value="created">
              Request date
            </NativeSelectOption>
            <NativeSelectOption value="reserved">Visit date</NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            name="from"
            type="date"
            defaultValue={filters.from}
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            name="to"
            type="date"
            defaultValue={filters.to}
            className="h-9"
          />
        </div>
        <Button type="submit">Update</Button>
        <Link
          href="/admin/sources"
          className={buttonVariants({ variant: "ghost" })}
        >
          Last 30 days
        </Link>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Bookings" value={totals.bookings} />
        <Stat label="Guests" value={totals.guests} />
        <Stat label="Confirmed" value={totals.confirmed} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Report
          title="By channel"
          empty="No bookings in this range."
          rows={byChannel.map((row) => ({
            key: row.channel,
            label: channelLabels[row.channel as SourceChannel] ?? row.channel,
            href: listLink({ channel: row.channel }),
            ...row,
          }))}
          totals={totals}
        />
        <Report
          title="By ref code"
          empty="No partner ref codes in this range. Share links like thekomunal.com/?ref=partner-name to track them."
          rows={byRef.map((row) => ({
            key: row.ref ?? "",
            label: row.ref ?? "",
            href: listLink({ ref: row.ref ?? "" }),
            ...row,
          }))}
        />
      </div>
    </AdminPage>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums">{value}</p>
    </div>
  )
}

type ReportRow = {
  key: string
  label: string
  href: string
  bookings: number
  guests: number
  confirmed: number
}

function Report({
  title,
  rows,
  empty,
  totals,
}: {
  title: string
  rows: ReportRow[]
  empty: string
  totals?: { bookings: number; guests: number; confirmed: number }
}) {
  return (
    <section className="rounded-xl border bg-card">
      <h2 className="px-4 pt-4 text-lg">{title}</h2>
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <Table className="mt-2">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">{title.replace("By ", "")}</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
              <TableHead className="text-right">Guests</TableHead>
              <TableHead className="pr-4 text-right">Confirmed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="pl-4">
                  <Link
                    href={row.href}
                    className="font-extrabold text-brand underline-offset-4 hover:underline"
                  >
                    {row.label}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.bookings}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.guests}
                </TableCell>
                <TableCell className="pr-4 text-right tabular-nums">
                  {row.confirmed}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {totals ? (
            <TableFooter>
              <TableRow>
                <TableCell className="pl-4">Total</TableCell>
                <TableCell className="text-right tabular-nums">
                  {totals.bookings}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {totals.guests}
                </TableCell>
                <TableCell className="pr-4 text-right tabular-nums">
                  {totals.confirmed}
                </TableCell>
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      )}
    </section>
  )
}
