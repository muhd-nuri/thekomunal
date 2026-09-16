// Komunal: CMS uploads on local disk (the Floria approach). Files live in UPLOAD_DIR,
// outside public/ because Next only serves public/ files that existed at build time,
// and are served back by src/app/media/[file]/route.ts.
import "server-only"
import { randomUUID } from "node:crypto"
import { mkdir, unlink, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import sharp, { type OutputInfo } from "sharp"

export const UPLOAD_DIR = resolve(
  process.env.UPLOAD_DIR || join(/*turbopackIgnore: true*/ process.cwd(), "uploads")
)
export const MEDIA_PREFIX = "/media/"

export const IMAGE_MAX_BYTES = 12 * 1024 * 1024
export const PDF_MAX_BYTES = 40 * 1024 * 1024
const IMAGE_MAX_EDGE = 2000
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
])

/** One flat directory of random names: no user input ever reaches a path. */
export const MEDIA_FILENAME = /^[a-f0-9-]{36}\.(webp|pdf)$/

export class UploadError extends Error {}

async function write(name: string, data: Buffer) {
  await mkdir(UPLOAD_DIR, { recursive: true })
  await writeFile(join(/*turbopackIgnore: true*/ UPLOAD_DIR, name), data)
  return `${MEDIA_PREFIX}${name}`
}

/**
 * Re-encodes an image as WebP (EXIF orientation applied, metadata dropped) and
 * returns its public path and real dimensions. Decoding with sharp is the type
 * check: the browser-declared MIME type is only a first filter.
 */
export async function saveImage(file: File) {
  if (file.size === 0) throw new UploadError("Choose a photo to upload.")
  if (file.size > IMAGE_MAX_BYTES)
    throw new UploadError("That photo is over 12 MB. Try a smaller one.")
  if (!IMAGE_TYPES.has(file.type))
    throw new UploadError("Use a JPEG, PNG, WebP or AVIF photo.")

  const input = Buffer.from(await file.arrayBuffer())
  let output: { data: Buffer; info: OutputInfo }
  try {
    const image = sharp(input, { failOn: "error" })
    const meta = await image.metadata()
    if (!meta.width || !meta.height) throw new Error("no dimensions")
    output = await image
      .rotate()
      .resize({
        width: IMAGE_MAX_EDGE,
        height: IMAGE_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 5 })
      .toBuffer({ resolveWithObject: true })
  } catch {
    throw new UploadError("That file could not be read as a photo.")
  }

  const src = await write(`${randomUUID()}.webp`, output.data)
  return { src, width: output.info.width, height: output.info.height }
}

export async function savePdf(file: File) {
  if (file.size === 0) throw new UploadError("Choose a PDF to upload.")
  if (file.size > PDF_MAX_BYTES)
    throw new UploadError("That PDF is over 40 MB. Export a smaller copy.")
  const data = Buffer.from(await file.arrayBuffer())
  // Magic bytes, not the declared type.
  if (data.subarray(0, 5).toString("latin1") !== "%PDF-")
    throw new UploadError("That file is not a PDF.")
  const src = await write(`${randomUUID()}.pdf`, data)
  return { src, bytes: data.length }
}

/** Deletes an uploaded file. Paths outside /media/ (bundled images) are left alone. */
export async function removeUpload(src: string | null | undefined) {
  if (!src?.startsWith(MEDIA_PREFIX)) return
  const name = src.slice(MEDIA_PREFIX.length)
  if (!MEDIA_FILENAME.test(name)) return
  try {
    await unlink(join(/*turbopackIgnore: true*/ UPLOAD_DIR, name))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[uploads] could not delete", name, error)
    }
  }
}
