// Komunal: every admin screen except sign-in sits inside the sidebar shell.
// Pages still call requireAdmin() themselves: a layout does not re-run on client navigation.
import { cookies } from "next/headers"

import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdmin } from "@/lib/admin/guard"

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin()
  const sidebar = (await cookies()).get("sidebar_state")?.value

  return (
    <AdminShell
      user={{ name: session.user.name, email: session.user.email }}
      defaultOpen={sidebar !== "false"}
    >
      {children}
    </AdminShell>
  )
}
