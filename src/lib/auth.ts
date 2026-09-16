// Komunal: staff sign-in (Better Auth, email + password). Sign-up is closed: the first
// account is seeded from the environment, the rest are added from /admin/team.
import "server-only"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

import { db, schema } from "@/db"

const secret = process.env.BETTER_AUTH_SECRET

if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("BETTER_AUTH_SECRET is required in production.")
}

export const MIN_PASSWORD_LENGTH = 12

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: secret ?? "dev-only-insecure-secret-change-me",
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: { enabled: true, window: 60, max: 20 },
  // nginx sits in front: trust only the address it appends (see README).
  advanced: { ipAddress: { ipAddressHeaders: ["x-forwarded-for"] } },
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session

/** Creates a staff account with a password, bypassing the closed sign-up. */
export async function createStaffUser(input: {
  name: string
  email: string
  password: string
}) {
  const ctx = await auth.$context
  const email = input.email.trim().toLowerCase()
  const existing = await ctx.internalAdapter.findUserByEmail(email)
  if (existing) return { ok: false as const, error: "exists" as const }
  const hash = await ctx.password.hash(input.password)
  const created = await ctx.internalAdapter.createUser(
    {
      email,
      name: input.name.trim(),
      emailVerified: true,
    },
    { method: "admin" }
  )
  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: "credential",
    accountId: created.id,
    password: hash,
  })
  return { ok: true as const, user: created }
}
