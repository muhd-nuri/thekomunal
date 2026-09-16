// Komunal: Google reviews from the current site — verbatim, original BM/EN wording, never "cleaned up".

export type Review = {
  id: string
  name: string
  source: "Google review"
  /** Verbatim text; line breaks preserved as \n */
  text: string
  /** Layout hint for the scattered pull-quote section */
  size: "lg" | "md" | "sm"
}

export const reviews: Review[] = [
  {
    id: "dayah-yahya",
    name: "dayah yahya",
    source: "Google review",
    // TODO: the current site truncates this review — pull the full text from Google
    text: "Love this place sooo much🥰🥰so cozy and comfortable n the foods alsoo sooo delicious weyhh mine was pesto pasta mushroom sedap gilerrrr🤤🤤🤤services also excellent✨So satisfied n planning to come again!!",
    size: "lg",
  },
  {
    id: "siti-khairiyah",
    name: "Siti Khairiyah",
    source: "Google review",
    text: "Love the deco and nice ambience!\nFood semua sedap!\nCoffee and chocolate also not bad.\nPls try their charcoal latte.",
    size: "md",
  },
  {
    id: "sofie-adie",
    name: "Sofie Adie",
    source: "Google review",
    text: "Tenang is good. The best place to chill out after having a hectic workday.\n\nGonna try another menu's whenever visiting here again😊",
    size: "sm",
  },
]
