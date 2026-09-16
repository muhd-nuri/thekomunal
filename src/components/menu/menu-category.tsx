// Komunal: one menu section — a sticky title with its photo on the left, a ruled price list on the right.
import Image from "next/image"

import { menuPage } from "@/data/pages"
import {
  formatPrice,
  type MenuCategory,
  type MenuGroup,
  type MenuItem,
} from "@/lib/menu"
import { cn } from "@/lib/utils"

type Tone = "ink" | "white"

function BestSellerBadge({ tone }: { tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-block rounded-blob px-2.5 py-0.5 text-[0.6875rem] font-extrabold tracking-[0.06em] uppercase",
        tone === "white" ? "bg-surface text-brand" : "bg-brand text-white"
      )}
    >
      {menuPage.bestSellerBadge}
    </span>
  )
}

/** Name-and-price lists (drinks, add-ons) read better as two tight columns. */
function isCompact(group: MenuGroup) {
  return group.items.every(
    (item) =>
      !item.description &&
      !item.choices &&
      item.prices.length === 1 &&
      !item.prices[0].label
  )
}

function Item({
  item,
  tone,
  compact = false,
}: {
  item: MenuItem
  tone: Tone
  compact?: boolean
}) {
  const muted = tone === "white" ? "text-white/75" : "text-ink-muted"
  const single = item.prices.length === 1 && !item.prices[0].label

  return (
    <li id={item.slug} className={cn("scroll-mt-24", !compact && "py-4")}>
      <div className="flex items-baseline gap-3">
        <h4
          className={cn(
            "leading-snug",
            compact ? "text-base font-medium" : "text-lg"
          )}
        >
          {item.name}
          {item.bestSeller ? (
            <>
              {" "}
              <span className="align-middle">
                <BestSellerBadge tone={tone} />
              </span>
            </>
          ) : null}
        </h4>
        {single ? (
          <>
            <span
              aria-hidden="true"
              className="min-w-6 flex-1 translate-y-[-0.25em] border-b border-dotted border-current opacity-30"
            />
            <span className="shrink-0 font-extrabold tabular-nums">
              {formatPrice(item.prices[0].amount)}
            </span>
          </>
        ) : null}
      </div>
      {item.description ? (
        <p className={cn("mt-1 max-w-[60ch] text-sm", muted)}>
          {item.description}
        </p>
      ) : null}
      {item.choices ? (
        <p className={cn("mt-1 text-sm", muted)}>
          <span className="font-extrabold">{item.choices.label}:</span>{" "}
          {item.choices.values.join(", ")}
        </p>
      ) : null}
      {!single ? (
        <div className="mt-2">
          {item.optionsLabel ? (
            <p className={cn("text-xs font-extrabold uppercase", muted)}>
              {item.optionsLabel}
            </p>
          ) : null}
          <ul className="mt-1 flex flex-col gap-1">
            {item.prices.map((price) => (
              <li
                key={price.label}
                className="flex items-baseline gap-3 text-[0.9375rem]"
              >
                <span>{price.label}</span>
                <span
                  aria-hidden="true"
                  className="min-w-6 flex-1 translate-y-[-0.25em] border-b border-dotted border-current opacity-30"
                />
                <span className="shrink-0 font-extrabold tabular-nums">
                  {formatPrice(price.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  )
}

/** Hot / Cold style groups: a real table, so each price is read with its column. */
function ColumnGroup({ group, tone }: { group: MenuGroup; tone: Tone }) {
  const columns = group.columns ?? []
  const muted = tone === "white" ? "text-white/75" : "text-ink-muted"

  return (
    <table className="mt-2 w-full border-collapse text-left">
      <caption className="sr-only">
        {group.name} prices by {columns.join(" and ").toLowerCase()}
      </caption>
      <thead>
        <tr className={cn("text-xs font-extrabold uppercase", muted)}>
          <th scope="col" className="py-2 font-extrabold">
            <span className="sr-only">Drink</span>
          </th>
          {columns.map((column) => (
            <th
              key={column}
              scope="col"
              className="w-20 py-2 text-right font-extrabold sm:w-28"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {group.items.map((item) => (
          <tr
            key={item.slug}
            className={cn(
              "border-t",
              tone === "white" ? "border-white/15" : "border-line"
            )}
          >
            <th scope="row" className="py-3 pr-3 text-base font-medium">
              {item.name}
            </th>
            {columns.map((column) => {
              const price = item.prices.find((p) => p.label === column)
              return (
                <td
                  key={column}
                  className="py-3 text-right font-extrabold tabular-nums"
                >
                  {price ? (
                    formatPrice(price.amount)
                  ) : (
                    <>
                      <span aria-hidden="true" className="opacity-40">
                        –
                      </span>
                      <span className="sr-only">Not available</span>
                    </>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function MenuCategorySection({
  category,
  tone = "ink",
}: {
  category: MenuCategory
  tone?: Tone
}) {
  const muted = tone === "white" ? "text-white/75" : "text-ink-muted"
  const rule = tone === "white" ? "divide-white/15" : "divide-line"
  const headingId = `${category.slug}-heading`

  return (
    <section
      id={category.slug}
      aria-labelledby={headingId}
      className="grid scroll-mt-24 gap-8 lg:grid-cols-12 lg:gap-16"
    >
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-24">
          <h2
            id={headingId}
            className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]"
          >
            {category.name}
          </h2>
          {category.availability ? (
            <p className={cn("mt-2 font-extrabold", muted)}>
              {category.availability}
            </p>
          ) : null}
          {category.image ? (
            <div className="relative mt-6 hidden aspect-[4/5] overflow-hidden rounded-card lg:block">
              <Image
                src={category.image.src}
                alt={category.image.alt}
                fill
                sizes="(min-width: 1280px) 400px, 30vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="lg:col-span-8">
        {category.groups.map((group) => (
          <div key={group.name} className="mb-10 last:mb-0">
            {/* A group that repeats the category name adds nothing, so it stays for screen readers only. */}
            <h3
              className={cn(
                "text-xl",
                group.name.toLowerCase() === category.name.toLowerCase() &&
                  "sr-only"
              )}
            >
              {group.name}
            </h3>
            {group.note ? (
              <p className={cn("mt-1 text-sm", muted)}>{group.note}</p>
            ) : null}
            {group.columns ? (
              <ColumnGroup group={group} tone={tone} />
            ) : (
              <ul
                className={cn(
                  isCompact(group)
                    ? "grid gap-x-10 sm:grid-cols-2 [&>li]:border-b [&>li]:py-3"
                    : "divide-y",
                  isCompact(group) &&
                    (tone === "white"
                      ? "[&>li]:border-white/15"
                      : "[&>li]:border-line"),
                  !isCompact(group) && rule
                )}
              >
                {group.items.map((item) => (
                  <Item
                    key={item.slug}
                    item={item}
                    tone={tone}
                    compact={isCompact(group)}
                  />
                ))}
              </ul>
            )}
          </div>
        ))}

        {category.addOns?.length ? (
          <div
            className={cn(
              "mt-6 rounded-card px-5 py-4",
              tone === "white" ? "bg-white/10" : "bg-surface"
            )}
          >
            <p className="text-sm font-extrabold uppercase">
              {menuPage.addOnsLabel}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[0.9375rem]">
              {category.addOns.map((addOn) => (
                <li key={addOn.label}>
                  {addOn.label}{" "}
                  <span className="font-extrabold tabular-nums">
                    +{formatPrice(addOn.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
