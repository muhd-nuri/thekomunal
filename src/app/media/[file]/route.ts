// Komunal: serves CMS uploads. nginx may serve /media/ straight off disk too, but
// next/image fetches local paths from this Node server, so the route must exist.
import { readFile, stat } from "node:fs/promises"
import { join } from "node:path"

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
    const body = await readFile(path)
    const extension = file.slice(file.lastIndexOf(".") + 1)
    return new Response(new Uint8Array(body), {
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
