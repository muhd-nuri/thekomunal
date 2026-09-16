// Komunal: the full menu — best-seller photo strip up top, then every section as a ruled price list.
import type { Metadata } from "next"
import Image from "next/image"
import { FileText } from "lucide-react"

import { CTAButton } from "@/components/cta-button"
import { MenuCategorySection } from "@/components/menu/menu-category"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
import { FinalCta } from "@/components/home/final-cta"
import { primaryOutlet } from "@/data/outlets"
import { menuPage } from "@/data/pages"
import {
  formatPrice,
  getMenu,
  getMenuPdf,
  getSignatureDishes,
  lowestPrice,
  menuNotes,
} from "@/lib/menu"

export const metadata: Metadata = {
  title: menuPage.metaTitle,
  description: menuPage.metaDescription,
  alternates: { canonical: "/menu" },
}

export default async function MenuPage() {
  const [categories, bestSellers, pdf] = await Promise.all([
    getMenu(),
    getSignatureDishes(),
    getMenuPdf(primaryOutlet.slug),
  ])
  const food = categories.filter((c) => c.kind === "food")
  const drinks = categories.filter((c) => c.kind === "drinks")
  const extras = categories.filter((c) => c.kind === "extras")

  return (
    <>
      <Section band="cream" className="pt-28 md:pt-36">
        <PageHeader
          eyebrow={menuPage.eyebrow}
          heading={menuPage.heading}
          emphasis={menuPage.emphasis}
          intro={menuPage.intro}
        >
          <p className="mt-3 text-sm text-ink-muted">
            {menuNotes.price} {menuNotes.updated}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <CTAButton variant="primary" href="/reserve">
              {menuPage.reserveLabel}
            </CTAButton>
            {pdf ? (
              <a
                href={pdf.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 font-extrabold text-brand underline-offset-4 hover:underline"
              >
                <FileText className="size-5" aria-hidden />
                {menuPage.pdfLabel}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        </PageHeader>

        <nav aria-label={menuPage.jumpLabel} className="mt-10">
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <a
                  href={`#${category.slug}`}
                  className="inline-flex min-h-[44px] items-center rounded-blob border border-brand/25 px-4 text-sm font-extrabold text-brand transition-colors hover:bg-brand hover:text-white"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Section>

      <Section band="white" edge="blob-top" id="best-sellers">
        <div className="max-w-[60ch]">
          <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
            {menuPage.bestSellers.eyebrow}
          </p>
          <h2 className="mt-3 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
            {menuPage.bestSellers.heading}
          </h2>
          <p className="mt-3 text-ink-muted">{menuPage.bestSellers.intro}</p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
          {bestSellers.map((dish) => (
            <li key={dish.slug}>
              <a href={`#${dish.slug}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-card">
                  <Image
                    src={dish.image.src}
                    alt={dish.image.alt}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-3 leading-snug font-extrabold">{dish.name}</p>
                <p className="text-sm text-ink-muted">
                  {dish.category} · {dish.prices.length > 1 ? "from " : ""}
                  {formatPrice(lowestPrice(dish))}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section band="cream">
        <div className="flex flex-col gap-24">
          {food.map((category) => (
            <MenuCategorySection key={category.slug} category={category} />
          ))}
        </div>
      </Section>

      <Section band="brand" edge="blob-top">
        <div className="flex flex-col gap-24">
          {drinks.map((category) => (
            <MenuCategorySection
              key={category.slug}
              category={category}
              tone="white"
            />
          ))}
        </div>
      </Section>

      <Section band="white" edge="blob-top">
        <div className="flex flex-col gap-16">
          {extras.map((category) => (
            <MenuCategorySection key={category.slug} category={category} />
          ))}
          <p className="text-sm text-ink-muted">
            {menuNotes.price} {menuNotes.updated}
          </p>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
