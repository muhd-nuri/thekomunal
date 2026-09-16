"use client"
// Komunal: photo field for CMS forms. Uploads straight away (sharp → WebP on the server),
// previews it, and writes {name}Src / {name}Width / {name}Height hidden inputs plus a
// visible {name}Alt description. The row keeps the photo only when the form is saved.
import { useId, useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Loader2, X } from "lucide-react"

import { uploadImageAction } from "@/app/admin/upload-action"
import { Field } from "@/components/admin/form-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { StoredImage } from "@/db/schema"
import { cn } from "@/lib/utils"

const MAX_MB = 12

export function ImageField({
  name,
  label,
  defaultImage,
  hint,
  error,
  altError,
  aspect = "aspect-square",
}: {
  name: string
  label: string
  defaultImage?: StoredImage | null
  hint?: string
  error?: string
  altError?: string
  /** Tailwind aspect class for the preview box. */
  aspect?: string
}) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<Omit<StoredImage, "alt"> | null>(
    defaultImage ?? null
  )
  const [alt, setAlt] = useState(defaultImage?.alt ?? "")
  const [status, setStatus] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const uploading = status !== null

  async function onFile(file: File | undefined) {
    if (!file) return
    setUploadError(null)
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`That photo is over ${MAX_MB} MB. Try a smaller one.`)
      return
    }
    setStatus("Uploading…")
    try {
      const form = new FormData()
      form.set("file", file)
      const result = await uploadImageAction(form)
      if (result.ok) {
        setImage({
          src: result.src,
          width: result.width,
          height: result.height,
        })
      } else {
        setUploadError(result.error)
      }
    } catch {
      setUploadError(
        "Couldn't reach the server. Check your connection and try again."
      )
    } finally {
      setStatus(null)
      if (input.current) input.current.value = ""
    }
  }

  return (
    <Field
      label={label}
      htmlFor={`${id}-file`}
      error={error ?? uploadError ?? undefined}
      hint={hint}
    >
      <div className="@container">
        <div className="flex flex-col gap-3 @md:flex-row @md:items-start">
          <div
            className={cn(
              "relative w-40 shrink-0 overflow-hidden rounded-lg border bg-muted",
              aspect
            )}
          >
            {image ? (
              <Image
                src={image.src}
                alt=""
                fill
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                No photo
              </div>
            )}
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input
              ref={input}
              id={`${id}-file`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(event) => onFile(event.target.files?.[0])}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => input.current?.click()}
              >
                <ImagePlus data-icon="inline-start" />
                {image ? "Replace photo" : "Upload photo"}
              </Button>
              {image ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={uploading}
                  onClick={() => setImage(null)}
                >
                  <X data-icon="inline-start" />
                  Remove
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {status ?? "JPEG, PNG, WebP or AVIF, up to 12 MB. Saved as WebP."}
            </p>
            {image ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${id}-alt`} className="text-sm font-medium">
                  Photo description
                </label>
                <Input
                  id={`${id}-alt`}
                  name={`${name}Alt`}
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                  placeholder="e.g. Nasi lemak with fried chicken and sambal"
                  aria-invalid={altError ? true : undefined}
                  maxLength={200}
                />
                <p
                  className={cn(
                    "text-xs",
                    altError
                      ? "font-extrabold text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {altError ?? "Read aloud to people who can't see the photo."}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <input type="hidden" name={`${name}Src`} value={image?.src ?? ""} />
      <input type="hidden" name={`${name}Width`} value={image?.width ?? ""} />
      <input type="hidden" name={`${name}Height`} value={image?.height ?? ""} />
    </Field>
  )
}
