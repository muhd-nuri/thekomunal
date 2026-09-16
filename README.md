# The Komunal

Website and table reservations for The Komunal, Bukit Rimau (Shah Alam).
Next.js 16 (App Router) · Tailwind v4 · Bun · self-hosted PostgreSQL + Drizzle.

## Develop

```bash
bun install
cp .env.example .env.local   # then fill in the values
bun run db:migrate           # creates/updates the tables
bun run dev
```

Checks: `bun test` · `bun run typecheck` · `bun run lint`.

## Environment

| Variable                                 | Needed for                                                      |
| ---------------------------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                   | Metadata base URL                                               |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`            | Guest WhatsApp links (`60…`, digits only)                       |
| `NEXT_PUBLIC_META_PIXEL_ID`              | Meta Pixel (PageView, Lead)                                     |
| `DATABASE_URL`                           | Reservations database (self-hosted PostgreSQL)                  |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Booking notifications to the staff group                        |
| `IP_HASH_SALT`                           | Salt for hashed IPs used by the rate limit (long random string) |

`NEXT_PUBLIC_*` values are baked in at build time, so rebuild after changing them.

## Deploying reservations (VPS, pm2 + nginx)

1. Create the production database and set `DATABASE_URL`, `TELEGRAM_*` and `IP_HASH_SALT` in the server environment.
2. `bun install && bun run db:migrate && bun run build`, then restart the app with pm2.
3. nginx must forward the client IP, or every guest shares one rate-limit bucket:
   `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`
   The app trusts only the **last** address in that header (the one nginx adds), so values a
   client sends itself are ignored. If Cloudflare or another CDN sits in front of nginx, enable
   nginx's `real_ip` module for the CDN's ranges first, otherwise the CDN's address is used.
4. Telegram is sent after the response (`after()`). Stop the app with SIGINT/SIGTERM and allow a
   10–30 s drain (pm2 `kill_timeout`) so pending notifications finish.
5. Running more than one app instance? Set the same `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` on all of them.

A booking is always saved, even if Telegram is down; those rows have `telegram_status = 'failed'`
and the reason in `telegram_error`.
