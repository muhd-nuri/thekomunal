// Komunal: the admin gate. Every admin page and every admin action checks it; the proxy
// redirect is only an optimistic shortcut, never the protection itself.
import "server-only"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

export async function getAdminSession() {
  return auth.api.getSession({ headers: await headers() })
}

/** For pages: bounce to sign-in, remembering where they were going. */
export async function requireAdmin(returnTo?: string) {
  const session = await getAdminSession()
  if (!session) {
    redirect(
      returnTo
        ? `/admin/login?next=${encodeURIComponent(returnTo)}`
        : "/admin/login"
    )
  }
  return session
}

/** For server actions and route handlers: throw instead of redirecting. */
export async function assertAdmin() {
  const session = await getAdminSession()
  if (!session) throw new Error("Not signed in.")
  return session
}

/** Only same-site admin paths are allowed as a post-login destination. */
export function safeAdminPath(next: string | undefined | null) {
  return next && /^\/admin(\/|$)/.test(next) && !next.startsWith("//")
    ? next
    : "/admin"
}
