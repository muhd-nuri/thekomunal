// Komunal: copy for the inner pages (/menu, /visit, /community). Components never hardcode it.

export const menuPage = {
  metaTitle: "Menu",
  metaDescription:
    "The Komunal Bukit Rimau menu: nasi lemak, brunch toasts, burgers, pasta, lamb grill, sharing plates, desserts, specialty coffee and matcha. Prices exclude 6% SST.",
  eyebrow: "Menu",
  heading: "Eat with the",
  emphasis: "komunal",
  intro:
    "Breakfast from 8:30am, a full kitchen all day, and coffee the whole way through. Best sellers are marked.",
  jumpLabel: "Jump to a section",
  bestSellers: {
    eyebrow: "Start here",
    heading: "Best sellers",
    intro: "The plates our regulars order again and again.",
  },
  bestSellerBadge: "Best seller",
  addOnsLabel: "Add on",
  pdfLabel: "Download the full menu (PDF)",
  reserveLabel: "Reserve a table",
} as const

export const visitPage = {
  metaTitle: "Visit Komunal Bukit Rimau",
  metaDescription:
    "Find The Komunal Cafe in Seksyen 32, Bukit Rimau, Shah Alam. Opening hours, directions, space for groups of up to 60, delivery and table reservations.",
  eyebrow: "Visit us",
  heading: "Find your",
  emphasis: "komunal",
  intro:
    "A community café in Bukit Rimau, Shah Alam. Come for the coffee, stay for the table.",
  gettingHere: "Getting here",
  directionsLabel: "Get directions",
  hoursHeading: "Opening hours",
  hoursNote: "Breakfast is served until 11am. The kitchen runs all day.",
  groupsHeading: "Bring the group",
  groupsBody:
    "Team celebrations, birthdays, family days and meetings all fit. Book online for groups of up to {max}, or WhatsApp us for anything bigger.",
  groupsWhatsAppLabel: "WhatsApp for large groups",
  groupsWhatsAppText:
    "Hi Komunal! I'd like to ask about booking for a large group.",
  deliveryHeading: "Eat at home",
  deliveryBody: "Order Komunal Bukit Rimau for delivery.",
  contactHeading: "Say hello",
  mapTitle: "Map showing The Komunal Cafe, Bukit Rimau",
} as const

export const communityPage = {
  metaTitle: "Community",
  metaDescription:
    "Events, music nights and gatherings at The Komunal. See what we've hosted and plan your own event with us in Bukit Rimau, Shah Alam.",
  eyebrow: "Community",
  heading: "More than",
  emphasis: "coffee",
  intro:
    "Komunal means a place to gather. We host music nights, Ramadan evenings and the celebrations people plan around our tables.",
  pastEventLabel: "Past event",
  hostHeading: "Host yours here",
  hostBody:
    "Planning a team celebration, a birthday or a family gathering? We have room for groups of up to {max}, with a discussion space and whiteboard for meetings.",
  hostReserveLabel: "Book for your group",
  hostWhatsAppLabel: "Plan an event on WhatsApp",
  hostWhatsAppText: "Hi Komunal! I'd like to plan an event at Bukit Rimau.",
  followHeading: "See what's on next",
  followBody:
    "New events are announced on Instagram first. Follow along so you don't miss the next one.",
} as const

/** Replace {max} in a copy line. */
export const withMax = (line: string, max: number) =>
  line.replace("{max}", String(max))
