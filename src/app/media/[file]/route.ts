// Komunal: serves CMS uploads. nginx may serve /media/ straight off disk too, but
// next/image fetches local paths from this Node server, so the route must exist.
import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import { join } from "node:path"
import { Readable } from "node:stream"

import { MEDIA_FILENAME, UPLOAD_DIR } from "@/lib/uploads"

const TYPES: Record<string, string> = {
  webp: "image/webp",
  pdf: "application/pdf",
}

const notFound = () => new Response("Not found", { status: 404 })

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params
  if (!MEDIA_FILENAME.test(file)) return notFound()

  const path = join(/*turbopackIgnore: true*/ UPLOAD_DIR, file)
  if (!path.startsWith(UPLOAD_DIR + "/")) return notFound()

  try {
    const info = await stat(path)
    if (!info.isFile()) return notFound()
    // Streamed, not buffered: the menu PDF is ~33 MB and would otherwise sit
    // in memory once per concurrent download.
    const body = Readable.toWeb(
      createReadStream(path)
    ) as unknown as ReadableStream<Uint8Array>
    const extension = file.slice(file.lastIndexOf(".") + 1)
    return new Response(body, {
      headers: {
        "Content-Type": TYPES[extension] ?? "application/octet-stream",
        "Content-Length": String(info.size),
        // Replaced files always get a new name, so the old URL can be cached forever.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return notFound()
  }
}
