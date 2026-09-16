# Brand assets — provenance

All vectors in this folder were **extracted directly from the client's brand book PDF**
(`TK24 BRANDING V1.pdf`, "Komunal Branding 2025") with `pdftocairo -svg` and split per element.
Nothing here was traced, redrawn or generated. **Approved by the client for production on 2026-09-16.**

| File                                                    | Source page         | Notes                                                                                     |
| ------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `logomark.svg`                                          | p.2 Logo / Logomark | `fill="currentColor"` — tone set by CSS (inline via `src/components/brand/logo-paths.ts`) |
| `logotype.svg`                                          | p.3 Logo / Logotype | `fill="currentColor"`                                                                     |
| `characters/barista-latte.svg` … `barista-pourover.svg` | p.8 Characters V1.0 | cream fill `#f2eeea` + Komunal Blue outline                                               |
| `characters/line-*.svg`                                 | p.9 Characters V2.0 | line-only, Komunal Blue stroke; `*-white.svg` twins for blue bands                        |

Blob mask shapes live in `src/components/brand/blob-paths.ts` (approved 2026-09-16).
Social marks (WhatsApp, Instagram, Facebook) are simple-icons paths (CC0) in `src/components/brand/social-icons.tsx`.
