// Komunal: inner-page opener — eyebrow, big sentence-case H1 with one blob-pill word, a short intro.
import { Emphasis } from "@/components/emphasis"
import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  heading,
  emphasis,
  intro,
  tone = "ink",
  className,
  children,
}: {
  eyebrow: string
  heading: string
  emphasis?: string
  intro?: string
  /** "white" for headers sitting on the blue band. */
  tone?: "ink" | "white"
  className?: string
  children?: React.ReactNode
}) {
  const onBrand = tone === "white"

  return (
    <header className={className}>
      <p
        className={cn(
          "text-sm font-extrabold tracking-[0.08em] uppercase",
          onBrand ? "text-white/70" : "text-brand"
        )}
      >
        {eyebrow}
      </p>
      <h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] leading-none">
        {heading}
        {emphasis ? (
          <>
            {" "}
            <Emphasis className={onBrand ? "bg-surface text-brand" : undefined}>
              {emphasis}
            </Emphasis>
          </>
        ) : null}
      </h1>
      {intro ? (
        <p
          className={cn(
            "mt-5 max-w-[60ch] text-[1.0625rem]",
            onBrand ? "text-white/90" : undefined
          )}
        >
          {intro}
        </p>
      ) : null}
      {children}
    </header>
  )
}
