// Komunal: blob-radius pills — lift 2px on hover, never scale, never a second colour.
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const base =
  "inline-flex items-center gap-2 font-extrabold transition duration-300 ease-out"

const variantClass = {
  primary:
    "h-[52px] rounded-blob bg-brand px-7 text-white hover:-translate-y-0.5 hover:bg-brand-deep",
  "on-brand":
    "h-[52px] rounded-blob bg-surface px-7 text-brand hover:-translate-y-0.5 hover:bg-cream",
  // Tap target stays ≥ 44px even though it is only text.
  link: "group min-h-[44px]",
} as const

export function CTAButton({
  variant = "primary",
  href,
  children,
  className,
  external = false,
  ariaLabel,
}: {
  variant?: "primary" | "on-brand" | "link"
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
  ariaLabel?: string
}) {
  // next/link for in-app routes and hashes; a plain anchor for everything else.
  const isInternal = href.startsWith("/") || href.startsWith("#")
  const newTab = external || /^https?:/i.test(href)

  const content = (
    <>
      {children}
      {variant === "link" ? (
        <ArrowRight
          aria-hidden="true"
          className="size-5 transition-transform duration-300 ease-out group-hover:translate-x-1"
        />
      ) : null}
    </>
  )

  const classes = cn(base, variantClass[variant], className)

  if (isInternal && !external) {
    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={classes}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  )
}
