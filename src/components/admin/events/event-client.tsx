"use client"
// Komunal: events CMS client pieces — list controls, new event form, and the event editor
// with its poster wall (multi-upload, description, tilt, order).
import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Star,
  X,
} from "lucide-react"
import { toast } from "sonner"

import {
  createEvent,
  deleteEvent,
  moveEvent,
  saveEvent,
  setEventPublished,
  setFeaturedEvent,
} from "@/app/admin/(panel)/events/actions"
import { uploadImageAction } from "@/app/admin/upload-action"
import {
  ConfirmDelete,
  Field,
  MoveButtons,
  SubmitButton,
  useAdminForm,
} from "@/components/admin/form-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export function NewEventForm() {
  const { errors, pending, formProps } = useAdminForm(createEvent)
  return (
    <form {...formProps} className="flex flex-wrap items-end gap-3">
      <Field label="New event" htmlFor="new-event" error={errors.name}>
        <Input
          id="new-event"
          name="name"
          placeholder="e.g. Merdeka Acoustic Night"
          required
          className="w-72"
          maxLength={100}
        />
      </Field>
      <SubmitButton pending={pending} pendingLabel="Adding…">
        Add event
      </SubmitButton>
    </form>
  )
}

export function EventRowControls({
  id,
  name,
  isPublished,
  isFeatured,
  isFirst,
  isLast,
}: {
  id: string
  name: string
  isPublished: boolean
  isFeatured: boolean
  isFirst: boolean
  isLast: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={isPublished}
          disabled={pending}
          aria-label={`Publish ${name}`}
          onCheckedChange={(next) =>
            start(async () => {
              const result = await setEventPublished(id, next)
              if (result.ok)
                toast.success(`${name} is ${next ? "live" : "a draft"}.`)
              else toast.error(result.error)
              router.refresh()
            })
          }
        />
        <span className="w-16">{isPublished ? "Live" : "Draft"}</span>
      </label>
      <Button
        type="button"
        variant={isFeatured ? "secondary" : "ghost"}
        size="sm"
        disabled={pending || isFeatured}
        onClick={() =>
          start(async () => {
            await setFeaturedEvent(id)
            toast.success(`${name} is now on the homepage.`)
            router.refresh()
          })
        }
      >
        <Star
          data-icon="inline-start"
          className={isFeatured ? "fill-current" : undefined}
        />
        {isFeatured ? "On homepage" : "Feature"}
      </Button>
      <MoveButtons
        label={name}
        isFirst={isFirst}
        isLast={isLast}
        onMove={(d) => moveEvent(id, d)}
      />
    </div>
  )
}

type Poster = {
  key: string
  src: string
  width: number
  height: number
  alt: string
  tilt: number
}

export type EventFormValues = {
  id: string
  name: string
  slug: string
  period: string
  tagline: string
  description: string
  venue: string
  venueNote: string
  isPublished: boolean
  isUpcoming: boolean
  isFeatured: boolean
  posters: Omit<Poster, "key">[]
}

const TILTS = [-3, -2, -1.5, -1, 0, 1, 1.5, 2, 3]
const MAX_MB = 12

export function EventForm({ event }: { event: EventFormValues }) {
  const { errors, pending, formProps } = useAdminForm(saveEvent)
  const fileInput = useRef<HTMLInputElement>(null)
  const [posters, setPosters] = useState<Poster[]>(() =>
    event.posters.map((p) => ({ ...p, key: p.src }))
  )
  const [uploading, setUploading] = useState(0)

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    const list = [...files]
    setUploading((n) => n + list.length)
    for (const file of list) {
      try {
        if (file.size > MAX_MB * 1024 * 1024) {
          toast.error(`${file.name} is over ${MAX_MB} MB.`)
          continue
        }
        const form = new FormData()
        form.set("file", file)
        const result = await uploadImageAction(form)
        if (!result.ok) {
          toast.error(`${file.name}: ${result.error}`)
          continue
        }
        setPosters((current) => [
          ...current,
          {
            key: result.src,
            src: result.src,
            width: result.width,
            height: result.height,
            alt: "",
            // Alternate the lean so a new wall looks pinned up by hand.
            tilt: TILTS[(current.length * 3 + 2) % TILTS.length],
          },
        ])
      } catch {
        toast.error(`${file.name} didn't upload. Check your connection.`)
      } finally {
        setUploading((n) => n - 1)
      }
    }
    if (fileInput.current) fileInput.current.value = ""
  }

  const update = (key: string, patch: Partial<Poster>) =>
    setPosters((current) =>
      current.map((p) => (p.key === key ? { ...p, ...patch } : p))
    )
  const move = (index: number, delta: number) =>
    setPosters((current) => {
      const next = [...current]
      const target = index + delta
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  return (
    <form {...formProps} className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <input type="hidden" name="id" value={event.id} />
      <input
        type="hidden"
        name="posters"
        value={JSON.stringify(
          posters.map(({ src, width, height, alt, tilt }) => ({
            src,
            width,
            height,
            alt,
            tilt,
          }))
        )}
      />

      <div className="flex flex-col gap-6">
        <section className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2 md:p-6">
          <Field label="Event name" htmlFor="ev-name" error={errors.name}>
            <Input
              id="ev-name"
              name="name"
              defaultValue={event.name}
              required
              maxLength={100}
            />
          </Field>
          <Field
            label="When"
            htmlFor="ev-period"
            hint='Free text, e.g. "Ramadan 2025" or "Every Friday in March"'
          >
            <Input
              id="ev-period"
              name="period"
              defaultValue={event.period}
              maxLength={60}
            />
          </Field>
          <Field label="Tagline" htmlFor="ev-tagline">
            <Input
              id="ev-tagline"
              name="tagline"
              defaultValue={event.tagline}
              maxLength={120}
            />
          </Field>
          <Field
            label="Venue"
            htmlFor="ev-venue"
            hint="Leave empty if it's at Komunal Bukit Rimau."
          >
            <Input
              id="ev-venue"
              name="venue"
              defaultValue={event.venue}
              maxLength={120}
            />
          </Field>
          <Field
            label="Description"
            htmlFor="ev-description"
            className="md:col-span-2"
          >
            <Textarea
              id="ev-description"
              name="description"
              defaultValue={event.description}
              rows={5}
              maxLength={2000}
            />
          </Field>
          <Field
            label="Extra note"
            htmlFor="ev-note"
            className="md:col-span-2"
            hint="Small print under the tagline, e.g. “Held at our former Bukit Jelutong branch.”"
          >
            <Input
              id="ev-note"
              name="venueNote"
              defaultValue={event.venueNote}
              maxLength={160}
            />
          </Field>
          <Field label="Web address" htmlFor="ev-slug">
            <Input
              id="ev-slug"
              name="slug"
              defaultValue={event.slug}
              maxLength={80}
            />
          </Field>
        </section>

        <section className="rounded-xl border bg-card p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg">Posters</h2>
              <p className="text-sm text-muted-foreground">
                Shown as a pinned-up wall. The first five appear on the
                homepage.
              </p>
            </div>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              id="poster-files"
              onChange={(e) => onFiles(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading > 0}
              onClick={() => fileInput.current?.click()}
            >
              {uploading > 0 ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <ImagePlus data-icon="inline-start" />
              )}
              {uploading > 0 ? `Uploading ${uploading}…` : "Add posters"}
            </Button>
          </div>
          {errors.posters ? (
            <p className="mt-3 text-sm font-extrabold text-destructive">
              {errors.posters}
            </p>
          ) : null}
          {posters.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No posters yet. Portrait (4:5) artwork works best.
            </p>
          ) : (
            <ol className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {posters.map((poster, index) => (
                <li
                  key={poster.key}
                  className="flex flex-col gap-2 rounded-lg border p-3"
                >
                  <div
                    className="relative aspect-[4/5] overflow-hidden rounded bg-muted"
                    style={{ rotate: `${poster.tilt}deg` }}
                  >
                    <Image
                      src={poster.src}
                      alt=""
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  </div>
                  <label
                    className="text-xs font-extrabold"
                    htmlFor={`alt-${poster.key}`}
                  >
                    Poster {index + 1} description
                  </label>
                  <Textarea
                    id={`alt-${poster.key}`}
                    value={poster.alt}
                    onChange={(e) =>
                      update(poster.key, { alt: e.target.value })
                    }
                    rows={2}
                    maxLength={200}
                    placeholder="e.g. Morehcoustic poster: Pasca Sini, 14 March 2025"
                    aria-invalid={
                      !poster.alt && errors.posters ? true : undefined
                    }
                  />
                  <div className="flex items-center justify-between gap-2">
                    <NativeSelect
                      size="sm"
                      className="w-24"
                      aria-label={`Poster ${index + 1} tilt`}
                      value={String(poster.tilt)}
                      onChange={(e) =>
                        update(poster.key, { tilt: Number(e.target.value) })
                      }
                    >
                      {TILTS.map((t) => (
                        <NativeSelectOption key={t} value={t}>
                          {t === 0
                            ? "No tilt"
                            : `${t > 0 ? "+" : "−"}${Math.abs(t)}°`}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <div className="flex">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        aria-label={`Move poster ${index + 1} earlier`}
                      >
                        <ArrowLeft />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === posters.length - 1}
                        onClick={() => move(index, 1)}
                        aria-label={`Move poster ${index + 1} later`}
                      >
                        <ArrowRight />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() =>
                          setPosters((current) =>
                            current.filter((p) => p.key !== poster.key)
                          )
                        }
                        aria-label={`Remove poster ${index + 1}`}
                      >
                        <X />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Removed posters are deleted when you save.
          </p>
        </section>
      </div>

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-xl border bg-card p-4">
          <Toggle
            name="isPublished"
            defaultChecked={event.isPublished}
            title="Live on the website"
            help="Off keeps it as a draft."
          />
          <Toggle
            name="isUpcoming"
            defaultChecked={event.isUpcoming}
            title="Upcoming"
            help='Labelled "Coming up" and listed first. Switch off once it has happened.'
          />
          <Toggle
            name="isFeatured"
            defaultChecked={event.isFeatured}
            title="Feature on the homepage"
            help="Only one event at a time."
          />
        </section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SubmitButton
            pending={pending}
            className="h-10 px-5"
            pendingLabel="Saving…"
          >
            Save event
          </SubmitButton>
          <ConfirmDelete
            label="Delete event"
            title={`Delete ${event.name}?`}
            description="The event and all its posters are deleted. This can't be undone."
            onConfirm={() => deleteEvent(event.id)}
          />
        </div>
      </div>
    </form>
  )
}

function Toggle({
  name,
  defaultChecked,
  title,
  help,
}: {
  name: string
  defaultChecked: boolean
  title: string
  help: string
}) {
  return (
    <label className="flex items-start gap-3">
      <Switch name={name} defaultChecked={defaultChecked} className="mt-1" />
      <span className="text-sm">
        <span className="block font-extrabold">{title}</span>
        <span className="block text-muted-foreground">{help}</span>
      </span>
    </label>
  )
}
