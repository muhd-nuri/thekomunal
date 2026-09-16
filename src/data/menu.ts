// Komunal: signature dishes — working names taken from the current site's photo filenames.
// TODO: confirm names + descriptions against the client's current menu PDF
// (https://thekomunal.com/wp-content/uploads/2025/05/The-Komunal-Menu-2.pdf)

export type Dish = {
  slug: string
  name: string
  description: string
  image: { src: string; alt: string; width: number; height: number }
}

export const dishes: Dish[] = [
  {
    slug: "mushroom-pasta",
    name: "Mushroom pasta", // TODO: confirm (photo shows a mushroom toast/soup — may be "Mushroom soup")
    description:
      "Creamy, garlicky and full of mushrooms. The one people come back for.",
    image: {
      src: "/images/menu/mushroom-pasta.jpg",
      alt: "Toasted garlic bread over a bowl of creamy mushroom soup",
      width: 1800,
      height: 1200,
    },
  },
  {
    slug: "braised-lamb-shank",
    name: "Braised lamb shank",
    description:
      "Slow-braised until it falls off the bone, on tomato rice with roasted vegetables.",
    image: {
      src: "/images/menu/braised-lamb-shank.jpg",
      alt: "Braised lamb shank on tomato rice with roasted potatoes and rocket",
      width: 769,
      height: 769,
    },
  },
  {
    slug: "grilled-lamb",
    name: "Grilled lamb",
    description:
      "Three-pin lamb chops grilled over high heat, with mash, greens and gravy.",
    image: {
      src: "/images/menu/grilled-lamb.jpg",
      alt: "Grilled lamb chops with mashed potato, capsicum and broccoli",
      width: 1145,
      height: 769,
    },
  },
  {
    slug: "chicken-parmigiana",
    name: "Chicken parmigiana",
    description:
      "Crumbed chicken, tomato sauce and melted cheese with roasted potatoes.",
    image: {
      src: "/images/menu/chicken-parmigiana.jpg",
      alt: "Chicken parmigiana with roasted baby potatoes on a dark plate",
      width: 1181,
      height: 787,
    },
  },
  {
    slug: "slow-roast-butter",
    name: "Slow-roast butter chicken", // TODO: full name TBC
    description:
      "Slow-roasted chicken leg in a butter glaze, with rice and a fresh salad.",
    image: {
      src: "/images/menu/slow-roast-butter.jpg",
      alt: "Slow-roasted chicken leg with rice and salad",
      width: 1137,
      height: 767,
    },
  },
  {
    slug: "crusted-salmon",
    name: "Crusted salmon",
    description:
      "Herb-crusted salmon fillet on roasted vegetables with a lemon dill sauce.",
    image: {
      src: "/images/menu/crusted-salmon.jpg",
      alt: "Herb-crusted salmon fillet on roasted carrots and greens with a dill sauce",
      width: 1800,
      height: 1200,
    },
  },
  {
    slug: "omelette-on-toast",
    name: "Omelette on toast",
    description:
      "Soft omelette folded onto thick toast, with a side of fries. Breakfast, all day.",
    image: {
      src: "/images/menu/omelette-on-toast.jpg",
      alt: "Folded omelette on thick toast with a pile of fries",
      width: 1181,
      height: 787,
    },
  },
  {
    slug: "chicken-pesto",
    name: "Chicken pesto",
    description: "Basil pesto pasta with sliced grilled chicken and parmesan.",
    image: {
      src: "/images/menu/chicken-pesto.jpg",
      alt: "Pesto pasta topped with sliced grilled chicken",
      width: 1125,
      height: 779,
    },
  },
  {
    slug: "bolognese",
    name: "Bolognese",
    description: "Slow-cooked beef ragù on spaghetti, finished with parmesan.",
    image: {
      src: "/images/menu/bolognese.jpg",
      alt: "Spaghetti bolognese in a black bowl",
      width: 1098,
      height: 765,
    },
  },
  {
    slug: "duck-carbonara",
    name: "Duck carbonara",
    description:
      "Our twist on carbonara — smoked duck, egg yolk and cracked pepper.",
    image: {
      src: "/images/menu/duck-carbonara.jpg",
      alt: "Creamy carbonara with slices of smoked duck",
      width: 1181,
      height: 787,
    },
  },
  {
    slug: "spicy-creamy-pasta",
    name: "Spicy creamy pasta",
    description:
      "Creamy tomato pasta with prawns, squid and a proper chilli kick.",
    image: {
      src: "/images/menu/spicy-creamy-pasta.jpg",
      alt: "Spicy creamy seafood pasta with prawns and squid",
      width: 1133,
      height: 767,
    },
  },
  {
    slug: "amatriciana",
    name: "Amatriciana",
    description:
      "Tomato, beef bacon and pecorino on spaghetti. Simple and loud.",
    image: {
      src: "/images/menu/amatriciana.jpg",
      alt: "Spaghetti amatriciana in a rich tomato sauce",
      width: 1181,
      height: 787,
    },
  },
  {
    slug: "vongole",
    name: "Vongole",
    description:
      "Clams, garlic, chilli and white wine-free broth tossed through spaghetti.", // TODO: confirm description
    image: {
      src: "/images/menu/vongole.jpg",
      alt: "Spaghetti vongole with clams in their shells",
      width: 1100,
      height: 787,
    },
  },
]

/** The eight dishes shown in the homepage magazine spread (01–08). */
export const signatureDishSlugs = [
  "braised-lamb-shank",
  "mushroom-pasta",
  "crusted-salmon",
  "grilled-lamb",
  "duck-carbonara",
  "chicken-parmigiana",
  "spicy-creamy-pasta",
  "omelette-on-toast",
] as const

export const signatureDishes = signatureDishSlugs.map((slug) =>
  dishes.find((d) => d.slug === slug)!
)

export const menuPdfs = [
  {
    outletSlug: "bukit-rimau",
    label: "Bukit Rimau menu",
    href: "https://thekomunal.com/wp-content/uploads/2025/05/The-Komunal-Menu-2.pdf",
  },
] as const
