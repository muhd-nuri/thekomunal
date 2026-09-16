// Komunal: community events — poster artwork is client-supplied; description is verbatim from the current site.

export type EventPoster = {
  src: string
  alt: string
  width: number
  height: number
  /** Tilt in degrees for the poster wall (±2°) */
  tilt: number
}

export type CommunityEvent = {
  slug: string
  name: string
  period: string
  /** Venue as it should be shown today; empty when the original venue has closed. */
  venue: string
  /** Shown on /community when the posters print a venue that no longer operates. */
  venueNote?: string
  isUpcoming?: boolean
  description: string
  tagline: string
  posters: EventPoster[]
}

export const events: CommunityEvent[] = [
  {
    slug: "morehcoustic-2025",
    name: "Morehcoustic",
    period: "Ramadan 2025",
    // Held at the former Bukit Jelutong branch (now closed) — kept as a past community event.
    venue: "",
    venueNote: "Held at our former Bukit Jelutong branch.",
    tagline: "Muzikal Bertemu Spiritual",
    description:
      "Morehcoustic is a unique evening event series running throughout Ramadan 2025 that combines spiritual practices with acoustic musical performances. The name itself is a creative blend of “Moreh” (the traditional post-Tarawih meal) and “Acoustic,” representing our approach of blending spiritual traditions with contemporary entertainment.",
    posters: [
      {
        src: "/images/community/morehcoustic-2025-03-14-orkes-a-hizadin.jpg",
        alt: "Morehcoustic poster — Orkes A Hizadin, 14 March 2025",
        width: 762,
        height: 953,
        tilt: -2,
      },
      {
        src: "/images/community/morehcoustic-2025-03-14-pasca-sini.jpg",
        alt: "Morehcoustic poster — Pasca Sini, 14 March 2025",
        width: 870,
        height: 1087,
        tilt: 1.5,
      },
      {
        src: "/images/community/morehcoustic-2025-03-15-haikal-farid-fahimi-rahmat.jpg",
        alt: "Morehcoustic poster — Haikal Farid and Fahimi Rahmat, 15 March 2025",
        width: 836,
        height: 1045,
        tilt: -1,
      },
      {
        src: "/images/community/morehcoustic-2025-03-22-tbr.jpg",
        alt: "Morehcoustic poster — headliner to be revealed, 22 March 2025",
        width: 945,
        height: 1181,
        tilt: 2,
      },
      {
        src: "/images/community/morehcoustic-2025-03-28-tbr.jpg",
        alt: "Morehcoustic poster — headliner to be revealed, 28 March 2025",
        width: 960,
        height: 1201,
        tilt: -1.5,
      },
    ],
  },
]

export const featuredEvent = events[0]
