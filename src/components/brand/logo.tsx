// Komunal: the logo is the loudest thing in the room — blue on white or white on blue, nothing else.
import { logomarkPaths, logotypePaths } from "./logo-paths"
import { cn } from "@/lib/utils"

// Path data comes from the client's brand book (approved 2026-09-16).

export function Logo({
  variant = "logotype",
  tone = "blue",
  className,
  title,
}: {
  variant?: "logotype" | "logomark" | "avatar"
  tone?: "blue" | "white"
  /** Height comes from className (`h-8 w-auto`); width follows the viewBox. */
  className?: string
  /** Accessible name. Omit it and the logo is hidden from assistive tech. */
  title?: string
}) {
  const source = variant === "logotype" ? logotypePaths : logomarkPaths

  const mark = (markClassName?: string) => (
    <svg
      viewBox={source.viewBox}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={markClassName}
    >
      {title ? <title>{title}</title> : null}
      {source.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )

  if (variant === "avatar") {
    // Small formats only (brand book): the mark sits inside a rounded square.
    return (
      <span
        className={cn(
          "inline-flex aspect-square items-center justify-center rounded-[28%]",
          tone === "blue" ? "bg-brand text-white" : "bg-surface text-brand",
          className
        )}
      >
        {/* Height %, not padding %: percentage padding would resolve against the parent's width. */}
        {mark("h-[62%] w-auto")}
      </span>
    )
  }

  return mark(cn(tone === "blue" ? "text-brand" : "text-white", className))
}
