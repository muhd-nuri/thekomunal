// Komunal: CSV helpers. Cells that start with = + - @ are prefixed so spreadsheet apps
// never run guest-supplied text as a formula.
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  let text = value instanceof Date ? value.toISOString() : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(header: string[], rows: unknown[][]) {
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")
}
