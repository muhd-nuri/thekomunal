// Komunal: per-page metadata in one shape. Next merges `openGraph` and `twitter` shallowly —
// a page that sets either replaces the layout's — so every public page builds all of them here.
import type { Metadata } from "next"

import { hero, site } from "@/data/site"

export const SITE_URL = site.url
/** Homepage / fallback title (the root layout's `title.default`). */
export const DEFAULT_TITLE = `${site.name} · Specialty coffee for community, Shah Alam`

/**
 * The share card from src/app/opengraph-image.tsx. Listed explicitly because a
 * page that sets `openGraph` drops the file-convention image otherwise.
 */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: hero.image.alt,
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  /** Page title; the root layout's template appends " · The Komunal". Omit on the homepage. */
  title?: string
  description: string
  /** Canonical path, e.g. "/menu". */
  path: string
}): Metadata {
  const fullTitle = title ? `${title} · ${site.name}` : DEFAULT_TITLE
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: site.name,
      type: "website",
      locale: "en_MY",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
  }
}

/** JSON for a `<script type="application/ld+json">`, with `<` escaped so content can never close the tag. */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
