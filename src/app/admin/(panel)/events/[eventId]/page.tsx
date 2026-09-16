// Komunal: edit one event and its posters.
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { AdminPage } from "@/components/admin/admin-page"
import { EventForm } from "@/components/admin/events/event-client"
import { buttonVariants } from "@/components/ui/button"
import { getEventWithPosters } from "@/lib/admin/events-admin"
import { requireAdmin } from "@/lib/admin/guard"

export const metadata: Metadata = { title: "Event" }

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const { eventId } = await params
  const { created } = await searchParams
  await requireAdmin(`/admin/events/${eventId}`)
  const event = await getEventWithPosters(eventId)
  if (!event) notFound()

  return (
    <AdminPage
      title={event.name}
      description={
        event.isPublished
          ? "Live on the Community page."
          : "Draft: not on the website yet."
      }
      action={
        <Link
          href="/admin/events"
          className={buttonVariants({ variant: "ghost" })}
        >
          <ArrowLeft data-icon="inline-start" />
          All events
        </Link>
      }
    >
      {created ? (
        <p
          role="status"
          className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          Event created as a draft. Add details and posters, then switch on
          “Live on the website”.
        </p>
      ) : null}
      <EventForm
        event={{
          ...event,
          posters: event.posters.map((p) => ({ ...p.image, tilt: p.tilt })),
        }}
      />
    </AdminPage>
  )
}
