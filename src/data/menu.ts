// Komunal: the Bukit Rimau menu, transcribed from the client's menu PDF (June 2024 file,
// linked from thekomunal.com). TODO(client): confirm the dishes and prices are still current.
//
// Read this through `src/lib/menu.ts`, never directly. Phase 4 moves the menu into Postgres
// (menu_categories / menu_items / menu_item_prices), and the accessor is the only thing that changes.
// Prices are whole sen (RM 1 = 100) so they map straight onto integer columns.

export type MenuImage = {
  src: string
  alt: string
  width: number
  height: number
}

/** One price. `label` is empty for a single-price item, otherwise the option (e.g. "Hot", "Sambal Udang Petai"). */
export type MenuPrice = { label: string; amount: number }

export type MenuItem = {
  slug: string
  name: string
  description?: string
  /** What the price labels choose between, e.g. "Protein option". Absent for single prices and hot/cold. */
  optionsLabel?: string
  prices: MenuPrice[]
  /** Free choices that don't change the price, e.g. egg styles. */
  choices?: { label: string; values: string[] }
  bestSeller?: boolean
  image?: MenuImage
}

/** A sub-heading inside a category, e.g. "Coffee" inside Drinks. */
export type MenuGroup = {
  name: string
  note?: string
  /** Column headings when every item is priced per column (e.g. Hot / Cold). */
  columns?: string[]
  items: MenuItem[]
}

export type MenuCategory = {
  slug: string
  name: string
  kind: "food" | "drinks" | "extras"
  /** When the category is served; empty when it does not apply (add-ons). */
  availability: string
  image?: MenuImage
  groups: MenuGroup[]
  /** Paid extras that belong to this category (e.g. pasta add-ons). */
  addOns?: MenuPrice[]
}

export type MenuPdf = { outletSlug: string; label: string; href: string }

const rm = (ringgit: number) => Math.round(ringgit * 100)
const one = (ringgit: number): MenuPrice[] => [
  { label: "", amount: rm(ringgit) },
]
const hotCold = (hot: number | null, cold: number | null): MenuPrice[] => [
  ...(hot === null ? [] : [{ label: "Hot", amount: rm(hot) }]),
  ...(cold === null ? [] : [{ label: "Cold", amount: rm(cold) }]),
]

const dish = (slug: string, alt: string, size: number): MenuImage => ({
  src: `/images/menu/dishes/${slug}.jpg`,
  alt,
  width: size,
  height: size,
})

const section = (slug: string, alt: string): MenuImage => ({
  src: `/images/menu/sections/${slug}.jpg`,
  alt,
  width: 662,
  height: 936,
})

export const allDay = "All day"
export const priceNote = "All prices exclude 6% SST."
export const menuUpdatedNote =
  "Prices and availability can change. Ask our team if you're unsure."

export const menuCategories: MenuCategory[] = [
  {
    slug: "breakfast",
    name: "Breakfast",
    kind: "food",
    availability: "8:30 to 11:00 AM",
    image: section(
      "breakfast",
      "Nasi lemak pandan with a fried egg, crispy chicken, cucumber and boiled egg"
    ),
    groups: [
      {
        name: "Breakfast",
        items: [
          {
            slug: "full-komunal-breakfast",
            name: "Full Komunal Breakfast",
            description:
              "Shibuya bread, ragout button mushroom, chicken sausages, baked beans, sautéed cherry tomatoes, mixed salad, beef streaky or chicken ham.",
            prices: one(30),
            choices: {
              label: "Eggs",
              values: ["Scrambled", "Omelette", "Sunny side up"],
            },
            bestSeller: true,
            image: dish(
              "full-komunal-breakfast",
              "Full breakfast plate with toast, chicken sausage, baked beans and salad",
              420
            ),
          },
          {
            slug: "nasi-lemak-pandan",
            name: "Nasi Lemak Pandan",
            description:
              "Pandan nasi lemak, cucumber, peanuts, fried anchovies, boiled egg and sambal.",
            optionsLabel: "Protein",
            prices: [
              { label: "Telur Mata", amount: rm(11) },
              { label: "Sambal Udang Petai", amount: rm(25) },
              { label: "Ayam Berempah Crispy", amount: rm(24) },
            ],
            bestSeller: true,
            image: dish(
              "nasi-lemak-pandan",
              "Nasi lemak pandan on a banana leaf with a fried egg, crispy chicken and sambal",
              600
            ),
          },
          {
            slug: "hot-pancake",
            name: "Hot Pancake",
            description:
              "Pancakes, maple syrup, strawberry sauce, strawberries, blueberries, vanilla ice cream, whipped cream and butter.",
            prices: one(25),
          },
        ],
      },
    ],
  },
  {
    slug: "brunch",
    name: "Brunch",
    kind: "food",
    availability: allDay,
    image: section(
      "brunch",
      "Toasts topped with tomato and cream cheese, beef streaky and egg, and mushroom"
    ),
    groups: [
      {
        name: "Toasts",
        items: [
          {
            slug: "tomato-cream-cheese-toast",
            name: "Tomato Cream Cheese Toast",
            description:
              "Shibuya bread, cherry tomatoes, cream cheese spread, spring onion.",
            prices: one(10),
          },
          {
            slug: "mushroom-toast",
            name: "Mushroom Toast",
            description:
              "Shibuya bread, cream cheese spread, ragout button mushroom, spring onion.",
            prices: one(12),
          },
          {
            slug: "beef-streaky-egg-toast",
            name: "Beef Streaky & Egg Toast",
            description:
              "Shibuya bread, spicy mayo, scrambled egg, beef streaky, spring onion, butter.",
            prices: one(16),
          },
          {
            slug: "egg-shrimp-toast",
            name: "Egg Shrimp Toast",
            description:
              "Shibuya bread, spicy mayo, scrambled egg, cajun shrimp, wild rocket, butter.",
            prices: one(16),
            bestSeller: true,
          },
        ],
      },
      {
        name: "Bagels & waffles",
        items: [
          {
            slug: "handrolled-bagel",
            name: "Handrolled Bagel",
            optionsLabel: "Flavour",
            prices: [
              { label: "Cream Cheese", amount: rm(8) },
              { label: "Streaky Beef & Egg", amount: rm(16) },
              { label: "Chicken Ham & Cheese", amount: rm(15) },
            ],
          },
          {
            slug: "waffle-chicken",
            name: "Waffle Chicken",
            description:
              "Waffle, crispy chicken wings, spicy mayo, maple syrup, spring onion.",
            prices: one(27),
            bestSeller: true,
            image: dish(
              "waffle-chicken",
              "Waffle topped with crispy chicken wings, spicy mayo and spring onion",
              560
            ),
          },
        ],
      },
    ],
  },
  {
    slug: "sandwiches",
    name: "Sandwiches",
    kind: "food",
    availability: allDay,
    image: section(
      "sandwich",
      "A hand holding a charcoal club sandwich above a basket of fries"
    ),
    groups: [
      {
        name: "Sandwiches",
        note: "Served with fries.",
        items: [
          {
            slug: "patty-melt",
            name: "Patty Melt",
            description:
              "Charcoal bread, minced beef bolognese, caramelised onion, spicy mayo, cheddar, spring onion.",
            prices: one(22),
            bestSeller: true,
          },
          {
            slug: "chicken-hash",
            name: "Chicken Hash",
            description:
              "Charcoal bread, spicy mayo, crispy chicken breast, cheddar, hash brown, tomato, spring onion.",
            prices: one(25),
          },
          {
            slug: "club-sandwich",
            name: "Club Sandwich",
            description:
              "Charcoal bread, spicy mayo, chicken ham, streaky beef, mixed salad, sunny side up egg, cheddar, spring onion.",
            prices: one(28),
          },
        ],
      },
    ],
  },
  {
    slug: "burgers",
    name: "Burgers",
    kind: "food",
    availability: allDay,
    image: section(
      "burgers",
      "A classic beef burger and a hot chicken burger with fries and onion rings"
    ),
    groups: [
      {
        name: "Burgers",
        note: "Served with fries and onion rings.",
        items: [
          {
            slug: "classic-hamburger",
            name: "Classic Hamburger",
            description:
              "Toasted brioche bun, 150g beef patty, cheddar, caramelised onion, spicy mayo, gherkin, romaine, tomato.",
            prices: one(29),
            bestSeller: true,
            image: dish(
              "classic-hamburger",
              "Beef burger with cheddar and lettuce beside fries and onion rings",
              440
            ),
          },
          {
            slug: "hot-chicken-burger",
            name: "Hot Chicken Burger",
            description:
              "Toasted brioche bun, crispy chicken chop, honey sriracha baste, spicy mayo, romaine, gherkin, tomato, cheddar.",
            prices: one(28),
          },
        ],
      },
    ],
  },
  {
    slug: "pasta",
    name: "Pasta",
    kind: "food",
    availability: allDay,
    image: section(
      "pasta",
      "Plates of beef bolognese, scampi olio and chicken almond alfredo"
    ),
    groups: [
      {
        name: "Pasta",
        items: [
          {
            slug: "mushroom-olio",
            name: "Mushroom Olio",
            description:
              "Spaghetti, garlic, parsley, ragout button mushroom, cherry tomatoes, butter, parmesan.",
            prices: one(15),
          },
          {
            slug: "scampi-olio",
            name: "Scampi Olio",
            description:
              "Spaghetti, garlic, chilli flakes, parsley, sautéed shrimp, cherry tomatoes, butter, parmesan, wild rocket.",
            prices: one(25),
          },
          {
            slug: "vongole-pasta",
            name: "Vongole Pasta",
            description:
              "Spaghetti, garlic, chilli flakes, parsley, white clams, cherry tomatoes, butter, parmesan.",
            prices: one(24),
          },
          {
            slug: "pesto-mushroom",
            name: "Pesto Mushroom",
            description:
              "Spaghetti, garlic, pesto, ragout button mushroom, cherry tomatoes, poached egg, parmesan.",
            prices: one(24),
            bestSeller: true,
            image: dish(
              "pesto-mushroom",
              "Pesto spaghetti with mushrooms and a poached egg on a white plate",
              460
            ),
          },
          {
            slug: "beef-bolognese",
            name: "Beef Bolognese",
            description:
              "Spaghetti, garlic, minced beef, slow-cooked tomato sauce, cherry tomatoes, parmesan, parsley.",
            prices: one(23),
          },
          {
            slug: "chicken-almond-alfredo",
            name: "Chicken Almond Alfredo",
            description:
              "Fettuccine, garlic, grilled chicken breast, skin-on almonds, alfredo sauce, poached egg, parmesan, parsley.",
            prices: one(27),
            bestSeller: true,
          },
          {
            slug: "rose-pasta",
            name: "Rosé Pasta",
            description:
              "Fettuccine, pomodoro sauce, cream, parmesan, poached egg, parsley.",
            optionsLabel: "Topping",
            prices: [
              { label: "Grilled Chicken Breast", amount: rm(26) },
              { label: "Sautéed Shrimp", amount: rm(24) },
              { label: "Beef Streaky", amount: rm(28) },
            ],
            bestSeller: true,
          },
          {
            slug: "streaky-beef-carbonara",
            name: "Streaky Beef Carbonara",
            description:
              "Spaghetti, streaky beef, cream, white button mushroom, butter, poached egg, parmesan, parsley.",
            prices: one(29),
          },
        ],
      },
    ],
    addOns: [
      { label: "Streaky Beef", amount: rm(4) },
      { label: "Grilled Chicken Breast", amount: rm(5) },
    ],
  },
  {
    slug: "rice-and-mains",
    name: "Rice & Mains",
    kind: "food",
    availability: allDay,
    image: section(
      "rice-mains",
      "Fried chicken chop with fries, salad and sauce on a white plate"
    ),
    groups: [
      {
        name: "Rice",
        items: [
          {
            slug: "teriyaki-poke-bowl",
            name: "Teriyaki Poke Bowl",
            description:
              "Pilaf rice, purple cabbage, carrot, corn, cucumber, green peas, teriyaki glaze, sesame dressing, sunny side up egg.",
            optionsLabel: "Protein",
            prices: [
              { label: "Minced Beef", amount: rm(15) },
              { label: "Grilled Chicken Chop", amount: rm(22) },
            ],
          },
          {
            slug: "spicy-buttermilk-chicken",
            name: "Spicy Buttermilk Chicken",
            description:
              "Pilaf rice, crispy chicken breast, chilli padi, garlic, curry leaves, side salad, garlic crackers, buttermilk sauce, sunny side up egg.",
            prices: one(23),
          },
        ],
      },
      {
        name: "Mains",
        items: [
          {
            slug: "rosemary-grill-chicken",
            name: "Rosemary Grill Chicken",
            description:
              "Grilled chicken chop, leek mashed potato, rosemary sauce, side salad, cherry tomatoes.",
            prices: one(26),
            bestSeller: true,
          },
          {
            slug: "classic-fish-and-chips",
            name: "Classic Fish & Chips",
            description:
              "Perch fillet, fries, mushy peas, side salad, tartar sauce.",
            prices: one(26),
          },
          {
            slug: "mediterranean-lamb-grill",
            name: "Mediterranean Lamb Grill",
            description:
              "Grilled lamb shoulder (about 180g), pilaf rice, side salad, cherry tomatoes, mint sauce, rosemary sauce.",
            prices: one(33),
            bestSeller: true,
            image: dish(
              "mediterranean-lamb-grill",
              "Grilled lamb shoulder with rice, salad and cherry tomatoes",
              400
            ),
          },
          {
            slug: "classic-chicken-chop",
            name: "Classic Chicken Chop",
            description:
              "Deep-fried chicken chop, fries, side salad, rosemary sauce.",
            prices: one(27),
          },
        ],
      },
    ],
  },
  {
    slug: "soup-and-salad",
    name: "Soup & Salad",
    kind: "food",
    availability: allDay,
    image: section(
      "soup-salad",
      "Chef salad, creamy mushroom soup with garlic bread, and butter clams with mantou"
    ),
    groups: [
      {
        name: "Soup & salad",
        items: [
          {
            slug: "chef-salad",
            name: "Chef Salad",
            description:
              "Mixed salad, romaine, carrot, cherry tomatoes, red onion, corn, charcoal croutons, sesame dressing, boiled egg, crispy streaky beef, parmesan.",
            prices: one(19),
          },
          {
            slug: "creamy-mushroom-soup",
            name: "Creamy Mushroom Soup",
            description:
              "Ragout button mushroom and cream, with Shibuya garlic bread.",
            prices: one(11),
          },
          {
            slug: "spicy-butterclam-mantou",
            name: "Spicy Butterclam Mantou",
            description:
              "White clams in butter, cream, chilli padi and chilli flakes, with three fried mantou.",
            prices: one(30),
            bestSeller: true,
            image: dish(
              "spicy-butterclam-mantou",
              "Clams in a creamy spicy butter sauce with golden fried mantou buns",
              640
            ),
          },
        ],
      },
    ],
    addOns: [{ label: "Grilled Chicken Breast (salad)", amount: rm(4) }],
  },
  {
    slug: "something-to-share",
    name: "Something to Share",
    kind: "food",
    availability: allDay,
    image: section(
      "something-to-share",
      "Baskets of onion rings, corn ribs, sweet potato fries and buffalo wings"
    ),
    groups: [
      {
        name: "To share",
        items: [
          {
            slug: "buffalo-wing",
            name: "Buffalo Wings",
            description:
              "Six wing drumettes tossed in honey sriracha, with cucumber, carrot and ranch dip.",
            prices: one(27),
            bestSeller: true,
          },
          {
            slug: "bolognese-loaded-fries",
            name: "Bolognese Loaded Fries",
            description:
              "Fries, beef bolognese, cheese sauce, mayonnaise, cheddar, purple cabbage, spring onion.",
            prices: one(13),
          },
          {
            slug: "hot-chicken-fries",
            name: "Hot Chicken Fries",
            description:
              "Fries, crispy chicken breast in honey sriracha, spicy mayo, cheese sauce, cheddar.",
            prices: one(15),
          },
          {
            slug: "classic-french-fries",
            name: "Classic French Fries",
            description: "Shaken with cajun spice, with spicy mayo.",
            prices: one(6),
          },
          {
            slug: "onion-ring",
            name: "Onion Rings",
            description: "With spicy mayo.",
            prices: one(13),
          },
          {
            slug: "chicken-popcorn",
            name: "Chicken Popcorn",
            description: "With spicy mayo.",
            prices: one(13),
          },
          {
            slug: "corn-rib",
            name: "Corn Ribs",
            description: "Fried corn with cajun spice and spicy mayo.",
            prices: one(13),
          },
          {
            slug: "sweet-potato-fries",
            name: "Sweet Potato Fries",
            description: "With ranch dip.",
            prices: one(17),
          },
        ],
      },
    ],
  },
  {
    slug: "kids-meal",
    name: "Kids Meal",
    kind: "food",
    availability: allDay,
    image: section(
      "kids-meal",
      "Mac and cheese and a basket of tempura nuggets with dip"
    ),
    groups: [
      {
        name: "Kids meal",
        items: [
          {
            slug: "tempura-nugget",
            name: "Tempura Nuggets",
            description: "Six pieces.",
            prices: one(11),
          },
          { slug: "mac-and-cheese", name: "Mac & Cheese", prices: one(9) },
        ],
      },
    ],
  },
  {
    slug: "sweet-bites",
    name: "Sweet Bites",
    kind: "food",
    availability: allDay,
    image: section(
      "sweet-bites",
      "French toast with berries and cream beside banana frites with ice cream"
    ),
    groups: [
      {
        name: "Sweet bites",
        items: [
          {
            slug: "french-toast",
            name: "French Toast",
            description:
              "Shibuya bread, strawberries, blueberries, caramel sauce, whipped cream.",
            prices: one(17),
            bestSeller: true,
            image: dish(
              "french-toast",
              "French toast with strawberries, blueberries and whipped cream",
              480
            ),
          },
          {
            slug: "banana-frites",
            name: "Banana Frites",
            description:
              "Banana spring rolls, vanilla ice cream, chocolate and caramel drizzle.",
            prices: one(10),
          },
          {
            slug: "churros",
            name: "Churros",
            description: "With chocolate sauce.",
            prices: one(10),
          },
          { slug: "classic-croffle", name: "Classic Croffle", prices: one(14) },
          { slug: "oreo-croffle", name: "Oreo Croffle", prices: one(16) },
          { slug: "affogato", name: "Affogato", prices: one(7) },
        ],
      },
    ],
  },
  {
    slug: "drinks",
    name: "Drinks",
    kind: "drinks",
    availability: allDay,
    image: section(
      "drinks",
      "Two layered iced mocktails on blue blocks, one red and one blue-green"
    ),
    groups: [
      {
        name: "Coffee",
        note: "Add vanilla, salted caramel or hazelnut syrup for RM 3.",
        columns: ["Hot", "Cold"],
        items: [
          {
            slug: "espresso-double-shot",
            name: "Espresso Double Shot",
            prices: hotCold(6, null),
          },
          {
            slug: "espresso-macchiato",
            name: "Espresso Macchiato",
            prices: hotCold(7, null),
          },
          {
            slug: "piccolo-latte",
            name: "Piccolo Latte",
            prices: hotCold(10, null),
          },
          { slug: "flat-white", name: "Flat White", prices: hotCold(11, null) },
          { slug: "cafe-latte", name: "Café Latte", prices: hotCold(12, 14) },
          { slug: "cappuccino", name: "Cappuccino", prices: hotCold(12, 14) },
          { slug: "americano", name: "Americano", prices: hotCold(8, 10) },
          {
            slug: "coconut-americano",
            name: "Coconut Americano",
            prices: hotCold(null, 14),
          },
          { slug: "mocha", name: "Mocha", prices: hotCold(14, 16) },
          {
            slug: "charcoal-latte",
            name: "Charcoal Latte",
            prices: hotCold(13, 15),
          },
        ],
      },
      {
        name: "Matcha",
        columns: ["Hot", "Cold"],
        items: [
          {
            slug: "matcha-latte",
            name: "Matcha Latte",
            prices: hotCold(13, 15),
          },
          {
            slug: "dirty-matcha",
            name: "Dirty Matcha",
            prices: hotCold(14, 16),
          },
          {
            slug: "strawberry-matcha",
            name: "Strawberry Matcha",
            prices: hotCold(null, 18),
          },
          {
            slug: "mango-matcha",
            name: "Mango Matcha",
            prices: hotCold(null, 17),
          },
          {
            slug: "coconut-matcha",
            name: "Coconut Matcha",
            prices: hotCold(null, 17),
          },
        ],
      },
      {
        name: "Basics",
        columns: ["Hot", "Cold"],
        items: [
          {
            slug: "dark-chocolate",
            name: "Dark Chocolate",
            prices: hotCold(14, 16),
          },
          { slug: "honey-lemon", name: "Honey Lemon", prices: hotCold(9, 11) },
          { slug: "lemon-tea", name: "Lemon Tea", prices: hotCold(null, 9) },
        ],
      },
      {
        name: "Tea pots",
        note: "Hot, with unlimited refills.",
        items: [
          { slug: "earl-grey", name: "Earl Grey", prices: one(9) },
          {
            slug: "chamomile-blossom",
            name: "Chamomile Blossom",
            prices: one(9),
          },
          { slug: "peppermint", name: "Peppermint", prices: one(9) },
        ],
      },
      {
        name: "Tea mocktails",
        note: "Served cold.",
        items: [
          { slug: "mango-calamansi", name: "Mango Calamansi", prices: one(15) },
          {
            slug: "butterfly-pea-tea",
            name: "Butterfly Pea Tea",
            prices: one(15),
          },
          { slug: "lychee-tea", name: "Lychee Tea", prices: one(15) },
        ],
      },
      {
        name: "Mocktails",
        note: "Served cold.",
        items: [
          { slug: "mango-lychee", name: "Mango Lychee", prices: one(17) },
          { slug: "strawberry-mocktail", name: "Strawberry", prices: one(17) },
          { slug: "virgin-mojito", name: "Virgin Mojito", prices: one(13) },
          { slug: "blue-paradise", name: "Blue Paradise", prices: one(16) },
        ],
      },
      {
        name: "Frappe",
        note: "Served cold.",
        items: [
          {
            slug: "cookies-and-cream-frappe",
            name: "Cookies & Cream",
            prices: one(16),
          },
          { slug: "mocha-frappe", name: "Mocha Frappe", prices: one(16) },
          { slug: "matcha-frappe", name: "Matcha Frappe", prices: one(16) },
          {
            slug: "chocolate-frappe",
            name: "Chocolate Frappe",
            prices: one(15),
          },
          {
            slug: "strawberry-frappe",
            name: "Strawberry Frappe",
            prices: one(19),
          },
          { slug: "mango-frappe", name: "Mango Frappe", prices: one(19) },
        ],
      },
      {
        name: "Frappuccino",
        note: "Vanilla, salted caramel or hazelnut. Served cold.",
        columns: ["Coffee", "Non-coffee"],
        items: [
          {
            slug: "frappuccino",
            name: "Frappuccino",
            prices: [
              { label: "Coffee", amount: rm(17) },
              { label: "Non-coffee", amount: rm(15) },
            ],
          },
        ],
      },
      {
        name: "Yogurt",
        note: "Served cold.",
        items: [
          { slug: "mango-yogurt", name: "Mango", prices: one(14) },
          { slug: "strawberry-yogurt", name: "Strawberry", prices: one(14) },
          { slug: "plain-yogurt", name: "Plain", prices: one(10) },
        ],
      },
    ],
  },
  {
    slug: "add-ons",
    name: "Add-ons",
    kind: "extras",
    availability: "",
    groups: [
      {
        name: "Add to any dish",
        items: [
          {
            slug: "add-sunny-side-up-egg",
            name: "Sunny Side Up Egg",
            prices: one(2),
          },
          { slug: "add-boiled-egg", name: "Boiled Egg", prices: one(2) },
          { slug: "add-scrambled-egg", name: "Scrambled Egg", prices: one(6) },
          { slug: "add-omelette", name: "Omelette", prices: one(6) },
          {
            slug: "add-chicken-sausage",
            name: "Chicken Sausage (1 pc)",
            prices: one(5),
          },
          {
            slug: "add-baked-beans",
            name: "Baked Beans (60g)",
            prices: one(3),
          },
          { slug: "add-side-salad", name: "Side Salad", prices: one(4) },
          {
            slug: "add-ragout-mushroom",
            name: "Ragout Mushroom",
            prices: one(5),
          },
          { slug: "add-beef-streaky", name: "Beef Streaky", prices: one(4) },
          { slug: "add-chicken-ham", name: "Chicken Ham", prices: one(3) },
          { slug: "add-hash-brown", name: "Hash Brown (1 pc)", prices: one(4) },
          { slug: "add-pilaf-rice", name: "Pilaf Rice", prices: one(3) },
          {
            slug: "add-garlic-bread",
            name: "Garlic Bread (4 slices)",
            prices: one(9),
          },
          {
            slug: "add-ice-cream",
            name: "Ice Cream (1 scoop)",
            prices: one(3),
          },
          {
            slug: "add-pasta",
            name: "Spaghetti or Fettuccine (160g)",
            prices: one(4),
          },
        ],
      },
    ],
  },
]

/** The eight dishes the homepage features, all marked BEST SELLER on the menu. */
export const signatureDishSlugs = [
  "nasi-lemak-pandan",
  "mediterranean-lamb-grill",
  "spicy-butterclam-mantou",
  "waffle-chicken",
  "pesto-mushroom",
  "classic-hamburger",
  "full-komunal-breakfast",
  "french-toast",
] as const

export const menuPdfs: MenuPdf[] = [
  {
    outletSlug: "bukit-rimau",
    label: "Full menu (PDF)",
    // TODO(phase 5): self-host a compressed copy; the original is 33 MB.
    href: "https://thekomunal.com/wp-content/uploads/2025/05/The-Komunal-Menu-2.pdf",
  },
]
