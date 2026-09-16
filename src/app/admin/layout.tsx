import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Komunal admin" },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-area bg-background text-foreground">{children}</div>
  )
}
