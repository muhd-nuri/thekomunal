"use server"
// Komunal: image upload for every CMS form. Returns the stored path and real size;
// the form saves it with the row. Unsaved uploads are cleaned by removeUpload on replace.
import { assertAdmin } from "@/lib/admin/guard"
import { saveImage, UploadError } from "@/lib/uploads"

export type UploadResult =
  | { ok: true; src: string; width: number; height: number }
  | { ok: false; error: string }

// Per staff account, per server process: enough for a poster wall, not for filling the disk.
const WINDOW_MS = 10 * 60 * 1000
const MAX_UPLOADS = 60
const recent = new Map<string, number[]>()

function allowUpload(userId: string) {
  const now = Date.now()
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < WINDOW_MS)
  if (hits.length >= MAX_UPLOADS) {
    recent.set(userId, hits)
    return false
  }
  hits.push(now)
  recent.set(userId, hits)
  return true
}

export async function uploadImageAction(form: FormData): Promise<UploadResult> {
  try {
    const session = await assertAdmin()
    if (!allowUpload(session.user.id))
      return {
        ok: false,
        error:
          "That's a lot of uploads at once. Wait a few minutes and try again.",
      }
    const file = form.get("file")
    if (!(file instanceof File))
      return { ok: false, error: "Choose a photo to upload." }
    const saved = await saveImage(file)
    return { ok: true, ...saved }
  } catch (error) {
    if (error instanceof UploadError) return { ok: false, error: error.message }
    console.error("[upload]", error)
    return { ok: false, error: "That upload didn't work. Try again." }
  }
}
