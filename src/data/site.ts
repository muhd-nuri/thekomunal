// Komunal: all site-level copy and contact facts live here — components never hardcode them.

export const site = {
  name: "The Komunal",
  /** Logotype reads "komunal" — public name to be confirmed by the client. */
  shortName: "komunal",
  tagline: "Specialty coffee for community",
  description:
    "A community specialty café in Bukit Rimau, Shah Alam, serving specialty coffee and a full kitchen — nasi lemak, pasta, lamb grill, breakfast — plus events worth coming back for.",
  entity: "THE KOMUNAL SDN. BHD. (1455687-W)",
  city: "Shah Alam",
  /** Current site lists 011-2668 5945 for enquiries — TODO: confirm canonical number. */
  phone: { display: "011-2668 5945", href: "tel:+601126685945" },
  /** Footer WhatsApp on the current site is 016-437 5378 — TODO: confirm canonical number. */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "60164375378",
  whatsappGreeting: "Hi Komunal! I have a question about…",
  socials: {
    instagram: {
      handle: "@thekomunalcafe",
      url: "https://www.instagram.com/thekomunalcafe/",
    },
    // TODO: confirm Facebook page URL (current site links the icon without a page URL)
    facebook: {
      handle: "The Komunal Cafe",
      url: "https://www.facebook.com/thekomunalcafe",
    },
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://thekomunal.com",
} as const

export const nav = {
  links: [
    { label: "Menu", href: "/menu" },
    { label: "Visit", href: "/visit" },
    { label: "Community", href: "/community" },
  ],
  cta: { label: "Reserve", href: "/reserve" },
} as const

/** Hero copy — option 1 from the master plan. */
export const hero = {
  eyebrow: "Specialty coffee · Shah Alam",
  shout: "LET'S NGOPI.",
  support:
    "Specialty coffee and good food, made for the komunal. Find your table in Shah Alam.",
  primary: { label: "Reserve a table", href: "/reserve" },
  secondary: { label: "Order delivery", href: "#visit" },
  image: {
    src: "/images/hero/cafe-guests-interior.jpg",
    alt: "Guests sharing a long table inside The Komunal café, brick wall and greenery behind them",
    width: 960,
    height: 1280,
  },
  /** Other hero options kept for A/B: */
  alternates: [
    {
      shout: "Coffee for everyone.",
      support:
        "Your community café in Bukit Rimau, open every day from 8:30am.",
    },
    {
      shout: "Good juju inside.",
      support:
        "Your everyday spot for specialty coffee, pasta and people you like.",
    },
  ],
} as const

/** Tape marquee phrases — short shout lines only (≤ 4 words), brand BM allowed. */
export const tapePhrases = [
  "LET'S NGOPI",
  "GOOD JUJU INSIDE",
  "COFFEE FOR EVERYONE",
  "OPEN DAILY 8:30AM",
] as const

export const usps = [
  "Specialty coffee, brewed properly",
  "A full kitchen, not just pastries",
  "Open daily 8:30am–10pm",
  "Community events worth coming back for",
] as const

export const reservation = {
  heading: "Book your table",
  shout: "BOOK YOUR TABLE.",
  note: "Your table is confirmed once our team WhatsApps you.",
  leadTime: "Please book at least 3 hours ahead.",
  comingSoon: {
    title: "Reservations are coming soon",
    body: "Our online booking is on its way. Until then, WhatsApp us your name, outlet, date, time and number of guests and we'll sort your table.",
    whatsappText:
      "Hi Komunal! I'd like to reserve a table. Name: — Outlet: — Date: — Time: — Guests: —",
  },
  cta: { label: "Reserve a table", href: "/reserve" },
} as const

export const sections = {
  outlets: {
    eyebrow: "Visit us",
    heading: "Find your",
    emphasis: "komunal",
    deliveryLabel: "Staying in? Order delivery",
  },
  menu: {
    eyebrow: "Signature menu",
    heading: "From the kitchen",
    intro:
      "A full kitchen, not just pastries. Our best sellers, from nasi lemak to lamb grill.",
    cta: { label: "See the menu", href: "/menu" },
  },
  community: {
    eyebrow: "Community",
    heading: "More than coffee.",
    cta: {
      label: "Follow @thekomunalcafe",
      href: "https://www.instagram.com/thekomunalcafe/",
    },
  },
  reviews: { eyebrow: "Google reviews", heading: "What they say" },
} as const
