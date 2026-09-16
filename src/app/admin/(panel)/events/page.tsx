// Komunal: events CMS home — list, publish, feature, order, add.
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { AdminPage } from "@/components/admin/admin-page"
import {
  EventRowControls,
  NewEventForm,
} from "@/components/admin/events/event-client"
import { buttonVariants } from "@/components/ui/button"
import { listEventsWithCounts } from "@/lib/admin/events-admin"
import { requireAdmin } from "@/lib/admin/guard"

export const metadata: Metadata = { title: "Events" }

export default async function EventsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>
}) {
  await requireAdmin("/admin/events")
  const { deleted } = await searchParams
  const events = await listEventsWithCounts()

  return (
    <AdminPage
      title="Events"
      description="Music nights, Ramadan evenings and other gatherings shown on the Community page. The featured one also appears on the homepage."
      action={
        <a
          href="/community"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline" })}
        >
          View community page
        </a>
      }
    >
      {deleted ? (
        <p
          role="status"
          className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          Event deleted.
        </p>
      ) : null}
      <section className="rounded-xl border bg-card">
        {events.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <ul className="divide-y">
            {events.map((event, index) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center gap-3 p-3 lg:flex-nowrap"
              >
                <Link
                  href={`/admin/events/${event.id}`}
                  className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 hover:bg-muted/60"
                >
                  <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-muted">
                    {event.cover ? (
                      <Image
                        src={event.cover.src}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-extrabold">{event.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[
                        event.isUpcoming ? "Upcoming" : "Past",
                        event.period,
                        `${event.posterCount} poster${event.posterCount === 1 ? "" : "s"}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                </Link>
                <EventRowControls
                  id={event.id}
                  name={event.name}
                  isPublished={event.isPublished}
                  isFeatured={event.isFeatured}
                  isFirst={index === 0}
                  isLast={index === events.length - 1}
                />
              </li>
            ))}
          </ul>
        )}
        <div className="border-t p-4">
          <NewEventForm />
        </div>
      </section>
    </AdminPage>
  )
}
