// Komunal: your own account — name and password.
import type { Metadata } from "next"

import { AdminPage } from "@/components/admin/admin-page"
import { ChangePasswordForm, OwnNameForm } from "@/components/admin/team-client"
import { requireAdmin } from "@/lib/admin/guard"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const session = await requireAdmin("/admin/settings")
  return (
    <AdminPage
      title="Settings"
      description={`Signed in as ${session.user.email}.`}
    >
      <section className="rounded-xl border bg-card p-4 md:p-6">
        <OwnNameForm name={session.user.name} />
      </section>
      <section className="mt-6 rounded-xl border bg-card p-4 md:p-6">
        <h2 className="mb-4 text-lg">Change password</h2>
        <ChangePasswordForm />
      </section>
    </AdminPage>
  )
}
