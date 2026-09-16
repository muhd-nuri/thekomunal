// Komunal: the guest's IP for rate limiting — trust only the hop our own proxy added.

/**
 * nginx (`$proxy_add_x_forwarded_for`) appends the real peer to whatever the client sent,
 * and `next start` fills the header from the socket only when it is missing. Either way the
 * LAST entry is the one a client cannot forge; earlier entries are client-supplied.
 * If a CDN ever sits in front of nginx, restore the visitor IP there (nginx `real_ip` module)
 * so this stays true.
 */
export function clientIpFrom(forwardedFor: string | null | undefined) {
  if (!forwardedFor) return null
  const parts = forwardedFor
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
  return parts.at(-1) ?? null
}
