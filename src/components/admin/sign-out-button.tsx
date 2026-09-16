"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await signOut()
        router.replace("/admin/login")
        router.refresh()
      }}
    >
      <LogOut data-icon="inline-start" />
      Sign out
    </Button>
  )
}
