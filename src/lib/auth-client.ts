"use client"
// Komunal: browser-side auth, used by the admin sign-in form and sign-out button.
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient()

export const { signIn, signOut } = authClient
