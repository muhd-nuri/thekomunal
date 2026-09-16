"use server"
// Komunal: image upload for every CMS form. Returns the stored path and real size;
// the form saves it with the row. Unsaved uploads are cleaned by removeUpload on replace.
import { assertAdmin } from "@/lib/admin/guard"
import { saveImage, UploadError } from "@/lib/uploads"

export type UploadResult =
  | { ok: true; src: string; width: number; height: number }
  | { ok: false; error: string }

export async function uploadImageAction(form: FormData): Promise<UploadResult> {
  try {
    await assertAdmin()
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
