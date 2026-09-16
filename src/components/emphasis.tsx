// Komunal: two-tone headline without a second colour — one word in a white-on-blue blob pill.
import { cn } from "@/lib/utils"

export function Emphasis({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        // Negative margin pulls the pill back into the line so the headline keeps its rhythm.
        "-mx-[0.08em] inline-block -rotate-2 rounded-blob bg-brand px-[0.35em] leading-[1.1] text-white",
        className
      )}
    >
      {children}
    </span>
  )
}
