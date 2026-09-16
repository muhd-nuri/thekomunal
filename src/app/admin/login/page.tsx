// Komunal: staff sign-in. No sign-up and no email reset: a forgotten password is
// reset by another admin from /admin/team.
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginForm } from "@/app/admin/login/login-form"
import { Logo } from "@/components/brand/logo"
import { getAdminSession, safeAdminPath } from "@/lib/admin/guard"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  const destination = safeAdminPath(typeof next === "string" ? next : null)
  if (await getAdminSession()) redirect(destination)

  return (
    <div className="flex min-h-svh items-center justify-center bg-brand px-5 py-16">
      <div className="w-full max-w-sm rounded-card bg-surface p-8 shadow-xl">
        <Logo className="h-8 w-auto" title="The Komunal" />
        <h1 className="mt-6 text-2xl">Staff sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          For the Komunal team. Guests never need an account.
        </p>
        <LoginForm next={destination} />
      </div>
    </div>
  )
}
