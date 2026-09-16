// Komunal: brand type — Outfit 800 (headings) + 500 (body), approved by the client as the permanent web face
// in place of Galano Grotesque. It sits behind --font-brand so any future swap is a one-file change.
import { Outfit } from "next/font/google"

export const brandFont = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "800"],
  display: "swap",
  variable: "--font-brand",
})
