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

/** Sets a new password and signs the person out everywhere. */
export async function resetStaffPassword(userId: string, password: string) {
  const ctx = await auth.$context
  const hash = await ctx.password.hash(password)
  await ctx.internalAdapter.updatePassword(userId, hash)
  await ctx.internalAdapter.deleteUserSessions(userId)
}

export async function removeStaffUser(userId: string) {
  const ctx = await auth.$context
  await ctx.internalAdapter.deleteUserSessions(userId)
  await ctx.internalAdapter.deleteUser(userId)
}

/**
 * Changes a signed-in person's own password after checking the current one, and signs
 * out their other devices. Done directly (not via auth.api.changePassword) so a server
 * action never has to rewrite the session cookie mid-request.
 */
export async function changeOwnPassword(input: {
  userId: string
  sessionToken: string
  currentPassword: string
  newPassword: string
}) {
  const ctx = await auth.$context
  const account = await ctx.internalAdapter.findCredentialAccount(input.userId)
  if (!account?.password) return false
  const valid = await ctx.password.verify({
    hash: account.password,
    password: input.currentPassword,
  })
  if (!valid) return false
  await ctx.internalAdapter.updatePassword(
    input.userId,
    await ctx.password.hash(input.newPassword)
  )
  const sessions = await ctx.internalAdapter.listSessions(input.userId)
  const others = sessions
    .map((s) => s.token)
    .filter((token) => token !== input.sessionToken)
  if (others.length) await ctx.internalAdapter.deleteSessions(others)
  return true
}
