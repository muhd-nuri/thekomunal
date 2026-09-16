import { expect, test } from "bun:test"

import { clientIpFrom } from "@/lib/client-ip"

test("uses the hop added by our proxy, not client-supplied values", () => {
  expect(clientIpFrom("1.2.3.4, 203.0.113.9")).toBe("203.0.113.9")
  expect(clientIpFrom("203.0.113.9")).toBe("203.0.113.9")
  expect(clientIpFrom(" ::1 ")).toBe("::1")
  expect(clientIpFrom("1.1.1.1,  , 2.2.2.2,")).toBe("2.2.2.2")
})

test("missing header", () => {
  expect(clientIpFrom(null)).toBeNull()
  expect(clientIpFrom("")).toBeNull()
})
