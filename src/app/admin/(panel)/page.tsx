// Komunal: admin overview — what needs attention now, and who is coming next.
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { AdminPage } from "@/components/admin/admin-page"
import { StatusBadge } from "@/components/admin/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { formatDay } from "@/lib/admin/format"
import { requireAdmin } from "@/lib/admin/guard"
import { overviewCounts, upcomingReservations } from "@/lib/admin/reservations"
import { formatTimeLabel, klDateOffset, klToday } from "@/lib/booking-time"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Overview" }

export default async function OverviewPage() {
  const session = await requireAdmin("/admin")
  const today = klToday()
  const weekEnd = klDateOffset(6)
  const [counts, upcoming] = await Promise.all([
    overviewCounts(today, weekEnd),
    upcomingReservations(today),
  ])

  const cards = [
    {
      label: "Waiting for WhatsApp",
      value: counts.newCount,
      href: "/admin/reservations?status=new&sort=created_desc",
      highlight: counts.newCount > 0,
    },
    {
      label: "Tables today",
      value: counts.todayCount,
      sub: `${counts.todayGuests} guests`,
      href: `/admin/reservations?from=${today}&to=${today}&sort=reserved_asc`,
    },
    {
      label: "Next 7 days",
      value: counts.weekCount,
      href: `/admin/reservations?from=${today}&to=${weekEnd}&sort=reserved_asc`,
    },
    {
      label: "Telegram failed",
      value: counts.failedTelegram,
      href: "/admin/reservations?sort=created_desc",
      highlight: counts.failedTelegram > 0,
    },
  ]

  return (
    <AdminPage
      title={`Hi ${session.user.name.split(" ")[0]}`}
      description={`Today is ${formatDay(today)}.`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              "rounded-xl border bg-card p-4 transition-colors hover:border-brand",
              card.highlight &&
                "border-brand bg-brand text-white hover:bg-brand-deep"
            )}
          >
            <p
              className={cn(
                "text-sm",
                card.highlight ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {card.label}
            </p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums">
              {card.value}
            </p>
            {card.sub ? (
              <p
                className={cn(
                  "text-xs",
                  card.highlight ? "text-white/80" : "text-muted-foreground"
                )}
              >
                {card.sub}
              </p>
            ) : null}
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-xl border bg-card">
        <div className="flex items-center justify-between gap-3 p-4">
          <h2 className="text-lg">Coming up</h2>
          <Link
            href={`/admin/reservations?from=${today}&sort=reserved_asc`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            See all
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">
            No upcoming reservations.
          </p>
        ) : (
          <ul className="divide-y border-t">
            {upcoming.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/admin/reservations/${row.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-muted/50 max-sm:relative max-sm:pr-24"
                >
                  <span className="w-full shrink-0 text-sm font-extrabold sm:w-44">
                    {formatDay(row.reservedDate)}
                    <span className="block text-xs font-medium text-muted-foreground">
                      {formatTimeLabel(row.reservedTime)}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    {row.name}
                    <span className="text-muted-foreground">
                      {" "}
                      · {row.guests} pax
                    </span>
                  </span>
                  <StatusBadge
                    status={row.status}
                    className="max-sm:absolute max-sm:top-3 max-sm:right-4"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPage>
  )
}
