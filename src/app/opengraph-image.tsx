// Komunal: the social share card — brand blue, the client's logotype, and the real café photo
// with a barista hijacking its edge (the site's hero, in 1200×630). No words beyond the logo,
// so it can never say something the client didn't. Rendered once at build.
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import sharp from "sharp"

import { logotypePaths } from "@/components/brand/logo-paths"
import { hero } from "@/data/site"

// Keep in sync with OG_IMAGE in src/lib/seo.ts, which pages reference directly.
export const alt = hero.image.alt
export const size = { width: 1200, height: 630 }
export const contentType = "image/jpeg"

const BRAND = "#24247b"

async function dataUri(publicPath: string, type: string) {
  const file = await readFile(join(process.cwd(), "public", publicPath))
  return `data:${type};base64,${file.toString("base64")}`
}

export default async function OpengraphImage() {
  const [photo, character] = await Promise.all([
    dataUri(hero.image.src, "image/jpeg"),
    dataUri("/brand/characters/barista-latte.svg", "image/svg+xml"),
  ])
  const [, , vbW, vbH] = logotypePaths.viewBox.split(" ").map(Number)
  const logoWidth = 560

  const png = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        background: BRAND,
        padding: "0 0 0 80px",
      }}
    >
      <svg
        viewBox={logotypePaths.viewBox}
        width={logoWidth}
        height={Math.round((logoWidth * vbH) / vbW)}
        fill="#ffffff"
      >
        {logotypePaths.paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>

      <div
        style={{
          position: "absolute",
          right: 60,
          top: 45,
          width: 432,
          height: 540,
          display: "flex",
        }}
      >
        <img
          src={photo}
          alt=""
          width={432}
          height={540}
          style={{ borderRadius: 48, objectFit: "cover" }}
        />
      </div>

      <img
        src={character}
        alt=""
        width={190}
        height={224}
        style={{ position: "absolute", right: 420, bottom: 30 }}
      />
    </div>,
    size
  )
  // ImageResponse only emits PNG (~530 KB for a photo card). JPEG keeps it near
  // 60 KB — link previews in WhatsApp and friends skip heavy images.
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": contentType },
  })
}
