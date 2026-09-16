// Komunal: small helpers for admin forms and actions.
import type { StoredImage } from "@/db/schema"

export type FormState = {
  ok?: boolean
  message?: string
  error?: string
  fieldErrors?: Record<string, string>
  /** Bumps on every submit so client effects can react to repeated results. */
  at?: number
}

export const text = (form: FormData, key: string, max = 500) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, max)

export const flag = (form: FormData, key: string) => {
  const value = form.get(key)
  return value === "on" || value === "true" || value === "1"
}

/** Reads the hidden inputs written by <ImageField name="…">. */
export function imageFrom(form: FormData, name: string): StoredImage | null {
  const src = text(form, `${name}Src`, 300)
  if (!src) return null
  if (!/^\/(media|images)\/[\w./-]+$/.test(src) || src.includes(".."))
    return null
  const width = Number(form.get(`${name}Width`))
  const height = Number(form.get(`${name}Height`))
  return {
    src,
    alt: text(form, `${name}Alt`, 200),
    width: Number.isFinite(width) && width > 0 ? Math.round(width) : 1200,
    height: Number.isFinite(height) && height > 0 ? Math.round(height) : 1200,
  }
}

export function jsonFrom<T>(form: FormData, key: string, fallback: T): T {
  try {
    return JSON.parse(String(form.get(key) ?? "")) as T
  } catch {
    return fallback
  }
}
