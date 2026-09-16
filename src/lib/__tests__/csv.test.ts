import { expect, test } from "bun:test"

import { csvCell, toCsv } from "@/lib/admin/csv"

test("quotes commas, quotes and newlines", () => {
  expect(csvCell('Tom "T", Jr')).toBe('"Tom ""T"", Jr"')
  expect(csvCell("line1\nline2")).toBe('"line1\nline2"')
  expect(csvCell(null)).toBe("")
  expect(csvCell(6)).toBe("6")
})

test("neutralises spreadsheet formulas", () => {
  expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"')
  expect(csvCell("+60123")).toBe("'+60123")
  expect(csvCell("@sum")).toBe("'@sum")
})

test("joins rows with CRLF", () => {
  expect(toCsv(["a", "b"], [[1, "x"]])).toBe("a,b\r\n1,x")
})
