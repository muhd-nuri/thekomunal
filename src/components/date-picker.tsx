"use client"
// Komunal: date picker — a field-styled trigger opening the shadcn calendar in a soft white card; blue pill for the chosen day.
import { useState } from "react"
import { format } from "date-fns"
import { CalendarDays, ChevronDown } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/** "2026-09-20" ↔ a local Date. Only Y/M/D are used, so the browser's time zone never shifts the day. */
function toDate(value: string) {
  const [y, m, d] = value.split("-").map(Number)
  return y && m && d ? new Date(y, m - 1, d) : undefined
}

function toValue(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  isUnavailable,
  placeholder,
  className,
  ...aria
}: {
  id: string
  /** "yyyy-MM-dd" or "" */
  value: string
  onChange: (value: string) => void
  /** Earliest selectable date, "yyyy-MM-dd" */
  min: string
  /** Latest selectable date, "yyyy-MM-dd" */
  max: string
  /** Extra rule for days inside the range that still can't be picked (e.g. no slots left). */
  isUnavailable?: (value: string) => boolean
  placeholder: string
  className?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  "aria-required"?: boolean | "true"
}) {
  const [open, setOpen] = useState(false)
  const selected = toDate(value)
  const minDate = toDate(min)
  const maxDate = toDate(max)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        type="button"
        aria-haspopup="dialog"
        className={cn(
          className,
          // Layout last so a field class like `block` can't override it.
          "flex items-center justify-between gap-3 text-left data-[popup-open]:border-brand data-[popup-open]:bg-brand-tint"
        )}
        {...aria}
      >
        <span className="flex min-w-0 items-center gap-3">
          <CalendarDays className="size-5 shrink-0 text-brand" aria-hidden />
          <span className={cn("truncate", !selected && "text-ink-muted")}>
            {selected ? format(selected, "EEE, d MMM yyyy") : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-brand transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-auto rounded-card bg-surface p-3 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] ring-1 ring-line"
      >
        <Calendar
          mode="single"
          required
          selected={selected}
          defaultMonth={selected ?? minDate}
          startMonth={minDate}
          endMonth={maxDate}
          weekStartsOn={1}
          disabled={(day) => {
            const v = toValue(day)
            return v < min || v > max || Boolean(isUnavailable?.(v))
          }}
          onSelect={(day) => {
            if (!day) return
            onChange(toValue(day))
            setOpen(false)
          }}
          className="bg-transparent p-0 [--cell-radius:var(--radius-blob)] [--cell-size:--spacing(11)]"
          classNames={{
            caption_label: "text-base font-extrabold text-brand",
            weekday:
              "flex-1 text-xs font-extrabold tracking-[0.06em] text-ink-muted uppercase select-none",
            today: "font-extrabold text-brand",
            day_button: "rounded-full font-medium",
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
