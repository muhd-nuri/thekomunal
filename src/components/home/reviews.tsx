// Komunal: guests in their own words — pull quotes scattered off-grid, one on a white card with a character leaning on it.
import { Character } from "@/components/brand/character"
import { Section } from "@/components/section"
import { reviews, type Review } from "@/data/reviews"
import { sections } from "@/data/site"
import { cn } from "@/lib/utils"

/** Off-grid placement + quote scale per size hint. No two quotes share a column. */
const placement: Record<Review["size"], string> = {
  lg: "lg:col-span-7",
  // pl-4 keeps this quote clear of the character hanging off the card beside it.
  md: "lg:col-span-5 lg:col-start-8 lg:mt-24 lg:pl-4",
  sm: "lg:col-span-5 lg:col-start-3 lg:-mt-6",
}

const quoteScale: Record<Review["size"], string> = {
  lg: "text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.25]",
  md: "text-xl leading-[1.5]",
  sm: "text-lg leading-[1.55]",
}

function QuoteBody({ review }: { review: Review }) {
  return (
    <>
      <blockquote>
        <span
          aria-hidden="true"
          className="block font-display text-6xl leading-none font-extrabold text-brand"
        >
          &ldquo;
        </span>
        {/* Verbatim, line breaks preserved. Body weight stays 500. */}
        <p
          className={cn(
            "mt-1 font-medium whitespace-pre-line text-ink",
            quoteScale[review.size]
          )}
        >
          {review.text}
        </p>
      </blockquote>

      <figcaption className="mt-5 text-sm">
        <span className="font-extrabold text-ink">&mdash; {review.name}</span>
        <span className="mt-0.5 block text-ink-muted">{review.source}</span>
      </figcaption>
    </>
  )
}

export function Reviews() {
  return (
    // The character hangs past the card's right edge; clip the axis, not the page.
    <Section band="cream" id="reviews" className="overflow-x-clip">
      <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
        {sections.reviews.eyebrow}
      </p>
      <h2 className="mt-4 max-w-[18ch] text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
        {sections.reviews.heading}
      </h2>

      <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:items-start lg:gap-x-8 lg:gap-y-0">
        {reviews.map((review) => (
          <figure
            key={review.id}
            className={cn("relative", placement[review.size])}
          >
            {review.size === "lg" ? (
              // Only the biggest quote gets a surface — three cards would read as a card grid.
              <div className="relative rounded-card bg-surface p-8 md:p-10">
                <QuoteBody review={review} />
                {/* The card edge is the "edge": absolute px offsets so the crossing
                    is identical whether the card is 335px or 687px wide. */}
                <Character
                  id="line-chin"
                  anchor="bottom-right"
                  offset={{
                    x: "clamp(20px, 3.4vw, 44px)",
                    y: "clamp(22px, 3vw, 40px)",
                  }}
                  width="clamp(90px, 12vw, 130px)"
                />
              </div>
            ) : (
              <QuoteBody review={review} />
            )}
          </figure>
        ))}
      </div>
    </Section>
  )
}
