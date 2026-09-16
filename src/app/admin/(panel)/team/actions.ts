"use server"
// Komunal: team accounts. Any signed-in staff member can add people, reset a password
// or remove an account, but never their own account and never the last one.
import { asc, count, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db, schema } from "@/db"
import { text, type FormState } from "@/lib/admin/form"
import { assertAdmin } from "@/lib/admin/guard"
import {
  changeOwnPassword as changePassword,
  createStaffUser,
  MIN_PASSWORD_LENGTH,
  removeStaffUser,
  resetStaffPassword,
} from "@/lib/auth"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const fail = (
  error: string,
  fieldErrors?: Record<string, string>
): FormState => ({
  ok: false,
  error,
  fieldErrors,
  at: Date.now(),
})
const done = (message: string): FormState => ({
  ok: true,
  message,
  at: Date.now(),
})

export async function listTeam() {
  await assertAdmin()
  return db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      createdAt: schema.user.createdAt,
    })
    .from(schema.user)
    .orderBy(asc(schema.user.createdAt))
}

export async function addTeamMember(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  await assertAdmin()
  const name = text(form, "name", 80)
  const email = text(form, "email", 200).toLowerCase()
  const password = String(form.get("password") ?? "")
  const fieldErrors: Record<string, string> = {}
  if (!name) fieldErrors.name = "Required"
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email"
  if (password.length < MIN_PASSWORD_LENGTH)
    fieldErrors.password = `At least ${MIN_PASSWORD_LENGTH} characters`
  if (Object.keys(fieldErrors).length)
    return fail("Check the highlighted fields.", fieldErrors)

  const result = await createStaffUser({ name, email, password })
  if (!result.ok)
    return fail("Someone already uses that email.", {
      email: "Already on the team",
    })
  revalidatePath("/admin/team")
  return done(
    `${name} can now sign in. Share the password with them privately.`
  )
}

export async function resetTeamPassword(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const userId = text(form, "userId", 64)
  const password = String(form.get("password") ?? "")
  if (userId === session.user.id)
    return fail("Change your own password in Settings.")
  if (password.length < MIN_PASSWORD_LENGTH)
    return fail(`Use at least ${MIN_PASSWORD_LENGTH} characters.`, {
      password: `At least ${MIN_PASSWORD_LENGTH} characters`,
    })
  const target = await db.query.user.findFirst({
    where: eq(schema.user.id, userId),
  })
  if (!target) return fail("That account no longer exists.")
  await resetStaffPassword(userId, password)
  return done(
    `New password set for ${target.name}. They've been signed out everywhere.`
  )
}

export async function removeTeamMember(userId: string) {
  const session = await assertAdmin()
  if (userId === session.user.id)
    return { ok: false, error: "You can't remove yourself." }
  const [{ n }] = await db.select({ n: count() }).from(schema.user)
  if (n <= 1) return { ok: false, error: "Keep at least one account." }
  await removeStaffUser(userId)
  revalidatePath("/admin/team")
  return { ok: true }
}

/* ------------------------------------------------------------ own account */

export async function updateOwnName(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const name = text(form, "name", 80)
  if (!name) return fail("Enter your name.", { name: "Required" })
  await db
    .update(schema.user)
    .set({ name, updatedAt: new Date() })
    .where(eq(schema.user.id, session.user.id))
  revalidatePath("/admin", "layout")
  return done("Name saved.")
}

export async function changeOwnPassword(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const session = await assertAdmin()
  const currentPassword = String(form.get("currentPassword") ?? "")
  const newPassword = String(form.get("newPassword") ?? "")
  const confirm = String(form.get("confirmPassword") ?? "")
  if (newPassword.length < MIN_PASSWORD_LENGTH)
    return fail(`Use at least ${MIN_PASSWORD_LENGTH} characters.`, {
      newPassword: `At least ${MIN_PASSWORD_LENGTH} characters`,
    })
  if (newPassword !== confirm)
    return fail("The new passwords don't match.", {
      confirmPassword: "Doesn't match",
    })
  const changed = await changePassword({
    userId: session.user.id,
    sessionToken: session.session.token,
    currentPassword,
    newPassword,
  })
  if (!changed)
    return fail("Your current password isn't right.", {
      currentPassword: "Incorrect",
    })
  return done("Password changed. Other devices have been signed out.")
}
