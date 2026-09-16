// Komunal: who can sign in to the admin.
import type { Metadata } from "next"

import { AdminPage } from "@/components/admin/admin-page"
import { AddMemberForm, MemberActions } from "@/components/admin/team-client"
import { formatDateTime } from "@/lib/admin/format"
import { requireAdmin } from "@/lib/admin/guard"
import { listTeam } from "./actions"

export const metadata: Metadata = { title: "Team" }

export default async function TeamPage() {
  const session = await requireAdmin("/admin/team")
  const team = await listTeam()

  return (
    <AdminPage
      title="Team"
      description="Everyone here can see bookings and edit the website. There's no public sign-up: add people yourself."
    >
      <section className="rounded-xl border bg-card">
        <ul className="divide-y">
          {team.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="font-extrabold">
                  {member.name}
                  {member.id === session.user.id ? (
                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      You
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {member.email} · added {formatDateTime(member.createdAt)}
                </p>
              </div>
              {member.id === session.user.id ? null : (
                <MemberActions id={member.id} name={member.name} />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-4 md:p-6">
        <h2 className="mb-4 text-lg">Add someone</h2>
        <AddMemberForm />
      </section>
    </AdminPage>
  )
}
