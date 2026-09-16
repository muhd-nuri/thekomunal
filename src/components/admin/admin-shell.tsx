"use client"
// Komunal: admin shell — shadcn Sidebar in Komunal blue (collapses to icons, Sheet on
// mobile, ⌘B), with a slim top bar for the trigger and sign-out.
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  ChartPie,
  ExternalLink,
  LayoutDashboard,
  Megaphone,
  Settings,
  Users,
  UtensilsCrossed,
} from "lucide-react"

import { SignOutButton } from "@/components/admin/sign-out-button"
import { Logo } from "@/components/brand/logo"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

const GROUPS = [
  {
    label: "Bookings",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      {
        href: "/admin/reservations",
        label: "Reservations",
        icon: CalendarDays,
      },
      { href: "/admin/sources", label: "Sources", icon: ChartPie },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
      { href: "/admin/events", label: "Events", icon: Megaphone },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/admin/team", label: "Team", icon: Users },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
]

export function AdminShell({
  children,
  user,
  defaultOpen,
}: {
  children: React.ReactNode
  user: { name: string; email: string }
  defaultOpen: boolean
}) {
  const pathname = usePathname()

  return (
    <TooltipProvider delay={300}>
      <SidebarProvider defaultOpen={defaultOpen} className="admin-area">
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-3 py-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-white group-data-[collapsible=icon]:justify-center"
            >
              <Logo variant="avatar" tone="white" className="size-7 shrink-0" />
              <span className="text-lg leading-none font-extrabold group-data-[collapsible=icon]:hidden">
                komunal
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            {GROUPS.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="text-white/60">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const active =
                        item.href === "/admin"
                          ? pathname === "/admin"
                          : pathname.startsWith(item.href)
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            isActive={active}
                            tooltip={item.label}
                            render={<Link href={item.href} />}
                          >
                            <item.icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="gap-2 p-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Open the website"
                  render={
                    <a href="/" target="_blank" rel="noopener noreferrer" />
                  }
                >
                  <ExternalLink />
                  <span>View website</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="px-2 text-xs group-data-[collapsible=icon]:hidden">
              <p className="truncate font-extrabold">{user.name}</p>
              <p className="truncate text-white/60">{user.email}</p>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-1 h-5" />
            <span className="text-xs font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
              Komunal admin
            </span>
            <div className="ml-auto">
              <SignOutButton />
            </div>
          </header>
          <div className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</div>
        </SidebarInset>
        <Toaster theme="light" position="top-center" richColors />
      </SidebarProvider>
    </TooltipProvider>
  )
}
