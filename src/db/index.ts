// Komunal: one Postgres pool per server process (reused across dev hot reloads).
import "server-only"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error("DATABASE_URL is not set")
}

const globalForDb = globalThis as unknown as {
  komunalSql?: ReturnType<typeof postgres>
}

const sql =
  globalForDb.komunalSql ??
  postgres(url, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
  })

if (process.env.NODE_ENV !== "production") globalForDb.komunalSql = sql

export const db = drizzle(sql, { schema })
export { schema }
