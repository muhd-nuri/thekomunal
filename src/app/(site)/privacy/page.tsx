// Komunal: privacy notice — a calm, readable cream page; brand blue only on eyebrows, links and list markers.
import type { Metadata } from "next"

import { Section } from "@/components/section"
import {
  privacyEn,
  privacyMeta,
  privacyMs,
  type PrivacyBlock,
  type PrivacyNotice,
} from "@/data/privacy"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: privacyMeta.metaTitle,
  description: privacyMeta.metaDescription,
  alternates: { canonical: "/privacy" },
}

const linkClass =
  "font-extrabold text-brand underline decoration-line underline-offset-4 hover:decoration-brand"

function Block({ block }: { block: PrivacyBlock }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>
    case "list":
      return (
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      )
    case "contact":
      return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          {block.items.map((item) => (
            <div key={item.label} className="contents">
              <dt className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
                {item.label}
              </dt>
              <dd>
                <a
                  href={item.href}
                  className={linkClass}
                  {...(item.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {item.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      )
    case "cookies":
      return (
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="w-[24%] py-3 pr-3 font-extrabold text-brand">
                {block.columns.name}
              </th>
              <th className="w-[20%] py-3 pr-3 font-extrabold text-brand">
                {block.columns.setBy}
              </th>
              <th className="py-3 pr-3 font-extrabold text-brand">
                {block.columns.purpose}
              </th>
              <th className="w-[20%] py-3 font-extrabold text-brand">
                {block.columns.duration}
              </th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.name} className="border-b border-line align-top">
                <td className="py-3 pr-3 font-extrabold break-words">
                  {row.name}
                </td>
                <td className="py-3 pr-3 break-words">{row.setBy}</td>
                <td className="py-3 pr-3 break-words">{row.purpose}</td>
                <td className="py-3 break-words">{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
  }
}

function Notice({
  notice,
  anchor,
  effectiveDate,
  lastReviewed,
  jump,
  headingLevel,
}: {
  notice: PrivacyNotice
  anchor: string
  effectiveDate: string
  lastReviewed: string
  jump: { label: string; href: string }
  /** The English title is the page H1; the Bahasa Melayu title sits under it as an H2. */
  headingLevel: "h1" | "h2"
}) {
  const Title = headingLevel
  const SectionTitle = headingLevel === "h1" ? "h2" : "h3"
  return (
    <div
      id={anchor}
      lang={notice.lang}
      className={cn(
        "scroll-mt-28",
        headingLevel === "h2" && "mt-24 border-t border-line pt-16 md:mt-32"
      )}
    >
      <header>
        <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
          {notice.eyebrow}
        </p>
        <Title className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-none">
          {notice.title}
        </Title>
        <p className="mt-6 text-[1.0625rem]">{notice.intro}</p>
        <p className="mt-4 text-sm text-ink-muted">
          {notice.effectiveLabel} {effectiveDate}
        </p>
        <a href={jump.href} className={cn(linkClass, "mt-4 inline-block")}>
          {jump.label} →
        </a>
      </header>

      <nav
        aria-label={notice.tocHeading}
        className="mt-10 border-y border-line py-6"
      >
        <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
          {notice.tocHeading}
        </p>
        <ol className="mt-4 grid gap-x-8 gap-y-2 text-[0.9375rem] sm:grid-cols-2">
          {notice.sections.map((section, i) => (
            <li key={section.id} className="flex gap-3">
              <span className="w-5 shrink-0 text-ink-muted tabular-nums">
                {i + 1}.
              </span>
              <a
                href={`#${section.id}`}
                className="underline-offset-4 hover:text-brand hover:underline"
              >
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-4">
        {notice.sections.map((section, i) => (
          <section key={section.id} aria-labelledby={section.id}>
            <SectionTitle
              id={section.id}
              className="mt-14 scroll-mt-28 text-2xl leading-[1.15]"
            >
              <span className="mr-2 text-brand tabular-nums">{i + 1}.</span>
              {section.heading}
            </SectionTitle>
            <div className="mt-5 flex flex-col gap-4 text-[1.0625rem]">
              {section.blocks.map((block, j) => (
                <Block key={j} block={block} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-14 text-sm text-ink-muted">{lastReviewed}</p>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <Section band="cream" className="pt-28 md:pt-36">
      <article className="mx-auto max-w-[68ch]">
        <Notice
          notice={privacyEn}
          anchor={privacyMeta.enAnchor}
          effectiveDate={privacyMeta.effectiveDate}
          lastReviewed={privacyMeta.lastReviewed}
          jump={privacyMeta.jumpToMs}
          headingLevel="h1"
        />
        <Notice
          notice={privacyMs}
          anchor={privacyMeta.msAnchor}
          effectiveDate={privacyMeta.effectiveDateMs}
          lastReviewed={privacyMeta.lastReviewedMs}
          jump={privacyMeta.jumpToEn}
          headingLevel="h2"
        />
      </article>
    </Section>
  )
}
