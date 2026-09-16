// Komunal: brand character registry — vector art extracted from the client's brand book (Komunal Branding 2025).
// Filled set (V1) reads best on photos; line set (V2) is for quieter spots. Never float one on flat colour.
// Approved by the client as the production character set (2026-09-16).

export type CharacterId =
  | "barista-latte"
  | "chef-cake"
  | "server-cups"
  | "chef-pan"
  | "customer-cup"
  | "customer-bowl"
  | "barista-pourover"
  | "line-sip"
  | "line-chin"
  | "line-latte"
  | "line-pourover"

export type CharacterAsset = {
  src: string
  width: number
  height: number
  alt: string
  set: "filled" | "line"
  /** Line characters have a white-stroke twin for use on blue bands. */
  srcWhite?: string
}

export const characters: Record<CharacterId, CharacterAsset> = {
  "barista-latte": {
    src: "/brand/characters/barista-latte.svg",
    width: 313,
    height: 369,
    alt: "",
    set: "filled",
  },
  "chef-cake": {
    src: "/brand/characters/chef-cake.svg",
    width: 317,
    height: 340,
    alt: "",
    set: "filled",
  },
  "server-cups": {
    src: "/brand/characters/server-cups.svg",
    width: 308,
    height: 344,
    alt: "",
    set: "filled",
  },
  "chef-pan": {
    src: "/brand/characters/chef-pan.svg",
    width: 295,
    height: 354,
    alt: "",
    set: "filled",
  },
  "customer-cup": {
    src: "/brand/characters/customer-cup.svg",
    width: 251,
    height: 322,
    alt: "",
    set: "filled",
  },
  "customer-bowl": {
    src: "/brand/characters/customer-bowl.svg",
    width: 385,
    height: 366,
    alt: "",
    set: "filled",
  },
  "barista-pourover": {
    src: "/brand/characters/barista-pourover.svg",
    width: 281,
    height: 346,
    alt: "",
    set: "filled",
  },
  "line-sip": {
    src: "/brand/characters/line-sip.svg",
    srcWhite: "/brand/characters/line-sip-white.svg",
    width: 367,
    height: 369,
    alt: "",
    set: "line",
  },
  "line-chin": {
    src: "/brand/characters/line-chin.svg",
    srcWhite: "/brand/characters/line-chin-white.svg",
    width: 294,
    height: 385,
    alt: "",
    set: "line",
  },
  "line-latte": {
    src: "/brand/characters/line-latte.svg",
    srcWhite: "/brand/characters/line-latte-white.svg",
    width: 333,
    height: 360,
    alt: "",
    set: "line",
  },
  "line-pourover": {
    src: "/brand/characters/line-pourover.svg",
    srcWhite: "/brand/characters/line-pourover-white.svg",
    width: 309,
    height: 459,
    alt: "",
    set: "line",
  },
}
