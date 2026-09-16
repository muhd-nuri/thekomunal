// Komunal: optimistic admin redirect. It only checks that a session cookie exists;
// every admin page and action still verifies the session itself.
import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === "/admin/login") return NextResponse.next()

  if (!getSessionCookie(request)) {
    const url = new URL("/admin/login", request.url)
    url.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
