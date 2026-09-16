// Komunal: date/money formatting for the admin, always in Kuala Lumpur time.
import { TZDate } from "@date-fns/tz"
import { format, formatDistanceToNowStrict } from "date-fns"

const TZ = "Asia/Kuala_Lumpur"

/** "Sat, 20 Sep 2026" from a yyyy-MM-dd string. */
export function formatDay(day: string) {
  const [y, m, d] = day.split("-").map(Number)
  return format(new Date(y, m - 1, d), "EEE, d MMM yyyy")
}

/** "20 Sep 2026, 7:30 PM" */
export function formatDateTime(at: Date) {
  return format(new TZDate(at, TZ), "d MMM yyyy, h:mm a")
}

export function timeAgo(at: Date) {
  return `${formatDistanceToNowStrict(at)} ago`
}
