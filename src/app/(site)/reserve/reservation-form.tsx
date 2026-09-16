"use client"
// Komunal: the booking card — white fields that turn blue-tinted on focus, pill chips for the occasion and time, no scroll motion.
import Link from "next/link"
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert, MapPin, Minus, Plus } from "lucide-react"

import { createReservation } from "@/app/(site)/reserve/actions"
import { WhatsAppIcon } from "@/components/brand/social-icons"
import { DatePicker } from "@/components/date-picker"
import { ctaClasses } from "@/components/cta-button"
import { getOutlet, primaryOutlet } from "@/data/outlets"
import { eventTypes, reservationCopy } from "@/data/reservation"
import { site } from "@/data/site"
import { availableSlots, formatTimeLabel } from "@/lib/booking-time"
import { cn } from "@/lib/utils"
import {
  HONEYPOT_FIELD,
  reservationFields,
  reservationSchema,
  type ReservationData,
  type ReservationField,
  type ReservationInput,
} from "@/lib/validation/reservation"

const copy = reservationCopy
const fieldCopy = reservationCopy.fields

const fieldClass =
  "block h-[52px] w-full min-w-0 rounded-field border-[1.5px] border-line bg-surface px-4 text-base text-ink transition-colors duration-200 ease-out outline-none placeholder:text-ink-muted focus:border-brand focus:bg-brand-tint focus:ring-2 focus:ring-brand focus-visible:outline-none aria-invalid:border-ink"

const labelClass = "block text-sm font-extrabold text-brand"

// Visually hidden radio inside a pill label: keyboard, screen readers and no-JS all still work.
const chipBase =
  "relative inline-flex min-h-11 cursor-pointer items-center rounded-blob border-[1.5px] px-4 text-[0.9375rem] font-medium transition-colors duration-200 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand"

const occasionChip = cn(
  chipBase,
  "border-line bg-surface text-ink hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:font-extrabold has-[:checked]:text-white"
)

const slotChip = cn(
  chipBase,
  "justify-center border-line bg-surface px-2 whitespace-nowrap text-ink tabular-nums hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:checked]:font-extrabold has-[:checked]:text-brand has-[:checked]:ring-2 has-[:checked]:ring-brand"
)

const stepperButton =
  "inline-flex size-[52px] shrink-0 items-center justify-center rounded-blob border-[1.5px] border-line bg-surface text-brand transition-colors duration-200 ease-out hover:border-brand hover:bg-brand-tint disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-surface"

type FormValues = Record<ReservationField, string>

const errorId = (field: string) => `${field}-error`

const noopSubscribe = () => () => {}

/** Zod's built-in wording (e.g. a key missing from FormData) never reaches a guest. */
function friendlyMessage(field: ReservationField, message: string) {
  if (!/^Invalid input/i.test(message)) return message
  return copy.missingField[field] ?? copy.fieldFallback
}

function nextDay(date: string) {
  const d = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return null
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

function slotGroups(slots: string[]) {
  return [
    {
      key: "morning",
      label: fieldCopy.time.groups.morning,
      slots: slots.filter((t) => t < "12:00"),
    },
    {
      key: "afternoon",
      label: fieldCopy.time.groups.afternoon,
      slots: slots.filter((t) => t >= "12:00" && t < "17:00"),
    },
    {
      key: "evening",
      label: fieldCopy.time.groups.evening,
      slots: slots.filter((t) => t >= "17:00"),
    },
  ].filter((g) => g.slots.length > 0)
}

function waHref(text: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-sm text-ink">
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-brand"
      />
      <span>{message}</span>
    </p>
  )
}

function Required() {
  return (
    <span aria-hidden="true" className="ml-0.5">
      *
    </span>
  )
}

function Optional({ children }: { children: string }) {
  return <span className="ml-1.5 font-medium text-ink-muted">({children})</span>
}

function WhatsAppLine({ text, href }: { text: string; href: string }) {
  return (
    <div className="mt-3 flex items-start gap-2 text-sm text-ink">
      <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-brand" />
      <div>
        <p>{text}</p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center font-extrabold text-brand underline underline-offset-4"
        >
          {copy.whatsappUs}
        </a>
      </div>
    </div>
  )
}

export function ReservationForm({
  outletSlug,
  nowIso,
  today,
  maxDate,
  defaultDate,
}: {
  outletSlug: string
  /** Server clock at render time, so the first client render lists the same slots. */
  nowIso: string
  today: string
  maxDate: string
  defaultDate: string
}) {
  const outlet = getOutlet(outletSlug) ?? primaryOutlet
  const maxGuests = outlet.maxGuestsOnline

  const [state, formAction, pending] = useActionState(createReservation, {
    status: "idle",
  })

  // Without JS the page re-renders from the action result, so seed the fields
  // from the values the server echoed back. With JS, RHF already holds them.
  const [defaults] = useState<FormValues>(() => {
    const echoed = state.status === "error" ? (state.values ?? {}) : {}
    return {
      name: echoed.name ?? "",
      email: echoed.email ?? "",
      phone: echoed.phone ?? "",
      company: echoed.company ?? "",
      eventType: echoed.eventType ?? "",
      outletSlug: outlet.slug,
      guests: echoed.guests ?? "2",
      date: echoed.date ?? defaultDate,
      time: echoed.time ?? "",
      notes: echoed.notes ?? "",
    }
  })

  const form = useForm<ReservationInput, unknown, ReservationData>({
    resolver: zodResolver(reservationSchema),
    mode: "onTouched",
    // Radios start unselected (""), which the enum type cannot express.
    defaultValues: defaults as ReservationInput,
  })
  const {
    register,
    control,
    setValue,
    getValues,
    setError,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = form

  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )

  // Held in state from the server's clock, then refreshed each minute so slots
  // inside the lead time drop off while the page stays open.
  const [now, setNow] = useState(() => new Date(nowIso))
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const date = String(useWatch({ control, name: "date" }) ?? "")
  const time = String(useWatch({ control, name: "time" }) ?? "")
  const guests = Number(useWatch({ control, name: "guests" }))

  const slots = useMemo(
    () => (date ? availableSlots(date, outlet.opening, now) : []),
    [date, outlet.opening, now]
  )
  const groups = useMemo(() => slotGroups(slots), [slots])
  const followingDay = date ? nextDay(date) : null
  const canTryNextDay = followingDay !== null && followingDay <= maxDate

  // A chosen time that is no longer offered (date changed, lead time passed) is cleared.
  useEffect(() => {
    if (time && !slots.includes(time)) {
      setValue("time", "", { shouldValidate: isSubmitted })
    }
  }, [time, slots, setValue, isSubmitted])

  // Map each server result onto the form once: field errors, then focus.
  const handledState = useRef<typeof state | null>(null)
  useEffect(() => {
    if (handledState.current === state) return
    handledState.current = state
    if (state.status !== "error") return

    const fieldErrors = state.fieldErrors ?? {}
    for (const field of reservationFields) {
      const message = fieldErrors[field]
      if (message) {
        setError(field, {
          type: "server",
          message: friendlyMessage(field, message),
        })
      }
    }

    const target = reservationFields
      .filter((field) => fieldErrors[field])
      .map((field) => {
        const inputs = formRef.current?.querySelectorAll<HTMLInputElement>(
          `[name="${field}"]`
        )
        if (!inputs?.length) return null
        const list = Array.from(inputs)
        const el = list.find((i) => i.checked) ?? list[0]
        if (el.type !== "hidden") return el
        return document.getElementById(field)
      })
      .find((el) => el !== null)

    if (target) target.focus()
    else alertRef.current?.focus()
  }, [state, setError])

  const errorFor = (field: ReservationField) => {
    const message = errors[field]?.message
    if (message) return message
    // Before hydration (no-JS response), show the server's field errors directly.
    const serverMessage =
      !hydrated && state.status === "error"
        ? state.fieldErrors?.[field]
        : undefined
    return serverMessage ? friendlyMessage(field, serverMessage) : undefined
  }

  const a11y = (field: ReservationField, hintId?: string) => {
    const message = errorFor(field)
    const describedBy = [hintId, message ? errorId(field) : undefined]
      .filter(Boolean)
      .join(" ")
    return {
      "aria-invalid": message ? true : undefined,
      "aria-describedby": describedBy || undefined,
    }
  }

  const stepGuests = (delta: number) => {
    const current = Number(getValues("guests"))
    const base = Number.isFinite(current) ? Math.round(current) : 1
    const next = Math.min(maxGuests, Math.max(1, base + delta))
    setValue("guests", String(next), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void handleSubmit(() => {
      const el = formRef.current
      if (!el) return
      startTransition(() => formAction(new FormData(el)))
    })(event)
  }

  const serverMessage = state.status === "error" ? state.message : null

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="reservation-form-heading"
      className="flex flex-col gap-7"
    >
      <div>
        <h2
          id="reservation-form-heading"
          className="text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.1] text-brand"
        >
          {copy.formHeading}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{copy.requiredNote}</p>
      </div>

      <div aria-live="polite">
        {serverMessage ? (
          <div
            ref={alertRef}
            tabIndex={-1}
            className="flex items-start gap-3 rounded-field bg-brand-tint px-4 py-3 text-ink outline-none focus-visible:outline-2 focus-visible:outline-brand"
          >
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-brand"
            />
            <p className="font-medium">{serverMessage}</p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {fieldCopy.name.label}
            <Required />
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder={fieldCopy.name.placeholder}
            aria-required="true"
            defaultValue={defaults.name}
            className={cn(fieldClass, "mt-2")}
            {...a11y("name")}
            {...register("name")}
          />
          <FieldError id={errorId("name")} message={errorFor("name")} />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            {fieldCopy.phone.label}
            <Required />
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={fieldCopy.phone.placeholder}
            aria-required="true"
            defaultValue={defaults.phone}
            className={cn(fieldClass, "mt-2")}
            {...a11y("phone", "phone-hint")}
            {...register("phone")}
          />
          <p id="phone-hint" className="mt-2 text-sm text-ink-muted">
            {fieldCopy.phone.hint}
          </p>
          <FieldError id={errorId("phone")} message={errorFor("phone")} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            {fieldCopy.email.label}
            <Required />
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={fieldCopy.email.placeholder}
            aria-required="true"
            defaultValue={defaults.email}
            className={cn(fieldClass, "mt-2")}
            {...a11y("email")}
            {...register("email")}
          />
          <FieldError id={errorId("email")} message={errorFor("email")} />
        </div>

        <div>
          <label htmlFor="company" className={labelClass}>
            {fieldCopy.company.label}
            <Optional>{fieldCopy.company.optional}</Optional>
          </label>
          <input
            id="company"
            type="text"
            autoComplete="organization"
            maxLength={120}
            defaultValue={defaults.company}
            className={cn(fieldClass, "mt-2")}
            {...a11y("company")}
            {...register("company")}
          />
          <FieldError id={errorId("company")} message={errorFor("company")} />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>
          {fieldCopy.eventType.label}
          <Required />
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {eventTypes.map((type) => (
            <label key={type.value} className={occasionChip}>
              <input
                type="radio"
                value={type.value}
                defaultChecked={defaults.eventType === type.value}
                className="sr-only"
                {...a11y("eventType")}
                {...register("eventType")}
              />
              {type.label}
            </label>
          ))}
        </div>
        <FieldError id={errorId("eventType")} message={errorFor("eventType")} />
      </fieldset>

      <div>
        <input
          type="hidden"
          defaultValue={defaults.outletSlug}
          {...register("outletSlug")}
        />
        <p className={labelClass}>{fieldCopy.outlet.label}</p>
        <p className="mt-2 flex items-center gap-2 rounded-field bg-cream px-4 py-3 font-extrabold text-ink">
          <MapPin aria-hidden="true" className="size-5 shrink-0 text-brand" />
          {fieldCopy.outlet.bookingAt(outlet.shortName)}
        </p>
        <FieldError
          id={errorId("outletSlug")}
          message={errorFor("outletSlug")}
        />
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
        <div>
          <label htmlFor="guests" className={labelClass}>
            {fieldCopy.guests.label}
            <Required />
          </label>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepGuests(-1)}
              disabled={hydrated && guests <= 1}
              aria-label={fieldCopy.guests.decrease}
              aria-controls="guests"
              className={stepperButton}
            >
              <Minus aria-hidden="true" className="size-5" />
            </button>
            <input
              id="guests"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxGuests}
              step={1}
              aria-required="true"
              defaultValue={defaults.guests}
              className={cn(
                fieldClass,
                "[appearance:textfield] text-center text-lg font-extrabold tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              )}
              {...a11y(
                "guests",
                guests >= maxGuests ? "guests-hint" : undefined
              )}
              {...register("guests")}
            />
            <button
              type="button"
              onClick={() => stepGuests(1)}
              disabled={hydrated && guests >= maxGuests}
              aria-label={fieldCopy.guests.increase}
              aria-controls="guests"
              className={stepperButton}
            >
              <Plus aria-hidden="true" className="size-5" />
            </button>
          </div>
          <FieldError id={errorId("guests")} message={errorFor("guests")} />
          {guests >= maxGuests ? (
            <div id="guests-hint">
              <WhatsAppLine
                text={copy.largeGroup(maxGuests)}
                href={waHref(copy.largeGroupWhatsAppText(outlet.shortName))}
              />
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="date" className={labelClass}>
            {fieldCopy.date.label}
            <Required />
          </label>
          {/* No JavaScript: the native picker posts the date (first "date" in the form wins). */}
          <noscript>
            <input
              type="date"
              name="date"
              min={today}
              max={maxDate}
              defaultValue={defaults.date}
              className={cn(fieldClass, "mt-2")}
            />
          </noscript>
          {/* Bound to form state: RHF does not write setValue() into hidden inputs. */}
          <input type="hidden" {...register("date")} value={date} />
          <DatePicker
            id="date"
            value={date}
            min={today}
            max={maxDate}
            placeholder={fieldCopy.date.placeholder}
            isUnavailable={(value) =>
              availableSlots(value, outlet.opening, now).length === 0
            }
            onChange={(value) =>
              setValue("date", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            className={cn(fieldClass, "mt-2")}
            aria-required="true"
            {...a11y("date")}
          />
          <FieldError id={errorId("date")} message={errorFor("date")} />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>
          {fieldCopy.time.label}
          <Required />
        </legend>
        {!date ? (
          <p className="mt-3 text-sm text-ink-muted">
            {fieldCopy.time.pickDate}
          </p>
        ) : groups.length === 0 ? (
          <div className="mt-3 rounded-field bg-cream px-4 py-4">
            <p className="text-ink">{fieldCopy.time.noSlots}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-6">
              {canTryNextDay ? (
                <button
                  type="button"
                  onClick={() =>
                    setValue("date", followingDay, {
                      shouldDirty: true,
                      shouldValidate: isSubmitted,
                    })
                  }
                  className="inline-flex min-h-11 items-center font-extrabold text-brand underline underline-offset-4"
                >
                  {fieldCopy.time.tryNextDay}
                </button>
              ) : null}
              <a
                href={waHref(copy.noSlotsWhatsAppText(outlet.shortName))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 font-extrabold text-brand underline underline-offset-4"
              >
                <WhatsAppIcon className="size-4" />
                {copy.whatsappUs}
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            {groups.map((group) => (
              <div
                key={group.key}
                role="group"
                aria-labelledby={`slots-${group.key}`}
              >
                <p
                  id={`slots-${group.key}`}
                  className="text-xs font-extrabold tracking-[0.08em] text-ink-muted uppercase"
                >
                  {group.label}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {group.slots.map((slot) => (
                    <label key={slot} className={slotChip}>
                      <input
                        type="radio"
                        value={slot}
                        defaultChecked={defaults.time === slot}
                        className="sr-only"
                        {...a11y("time")}
                        {...register("time")}
                      />
                      {formatTimeLabel(slot)}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <FieldError id={errorId("time")} message={errorFor("time")} />
      </fieldset>

      <div>
        <label htmlFor="notes" className={labelClass}>
          {fieldCopy.notes.label}
          <Optional>{fieldCopy.notes.optional}</Optional>
        </label>
        <textarea
          id="notes"
          rows={4}
          maxLength={1000}
          placeholder={fieldCopy.notes.placeholder}
          defaultValue={defaults.notes}
          className={cn(fieldClass, "mt-2 h-auto min-h-32 resize-y py-3")}
          {...a11y("notes")}
          {...register("notes")}
        />
        <FieldError id={errorId("notes")} message={errorFor("notes")} />
      </div>

      {/* Honeypot: off-screen rather than display:none, so naive bots still fill it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-auto -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor={HONEYPOT_FIELD}>{fieldCopy.honeypot.label}</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="flex flex-col gap-5 border-t border-line pt-6">
        <div className="text-sm text-ink-muted">
          <p>{copy.privacy}</p>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center font-extrabold text-brand underline underline-offset-4"
          >
            {copy.privacyLink}
          </Link>
        </div>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className={ctaClasses(
            "primary",
            "w-full justify-center text-base disabled:cursor-wait disabled:bg-brand-deep disabled:hover:translate-y-0 sm:w-auto sm:self-start"
          )}
        >
          {pending ? copy.submitting : copy.submit}
        </button>
        <p className="text-sm text-ink-muted">{copy.requestNote}</p>
      </div>
    </form>
  )
}
