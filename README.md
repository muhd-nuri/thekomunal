# The Komunal

Website and table reservations for The Komunal, Bukit Rimau (Shah Alam).
Next.js 16 (App Router) · Tailwind v4 · Bun · self-hosted PostgreSQL + Drizzle.

## Develop

```bash
bun install
cp .env.example .env.local   # then fill in the values
bun run db:migrate           # creates/updates the tables
bun run db:seed              # first admin + menu + events (skips anything already there)
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
| `BETTER_AUTH_SECRET`                     | Signs admin sessions (`openssl rand -base64 32`)                |
| `BETTER_AUTH_URL`                        | Public site URL, e.g. `https://thekomunal.com`                  |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`          | First admin account, created by `db:seed` (password 12+ chars)  |
| `UPLOAD_DIR`                             | Absolute folder for CMS uploads, outside the app                |

`NEXT_PUBLIC_*` values are baked in at build time, so rebuild after changing them.

## Admin (`/admin`)

Staff sign in at `/admin` with email and password. There is no public sign-up: the first
account comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` via `bun run db:seed`, and more people are
added (or have their password reset) from **Team**. Everyone signed in can:

- **Reservations:** filter, search, change status, WhatsApp the guest, resend to Telegram, export CSV.
- **Sources:** bookings and guests by channel and partner `?ref=` code.
- **Menu:** sections, groups, dishes, prices (single, options, or Hot/Cold columns), photos,
  sold-out switch, the 8 homepage dishes, and the menu PDF.
- **Events:** the Community page and the homepage's featured event, with poster uploads.

Saves refresh the homepage, `/menu` and `/community` straight away (no rebuild).
`src/data/menu.ts` and `src/data/events.ts` are only the seed source now.

**Build needs the database.** The public pages are prerendered from Postgres during
`bun run build`, so migrate and seed before the first build.

**Uploads** are re-encoded to WebP with sharp and saved in `UPLOAD_DIR` under random names,
then served from `/media/<file>`. Replaced or deleted photos are removed from disk; a photo
uploaded but never saved stays until someone cleans the folder. Back `UPLOAD_DIR` up with the
database.

## Deploying (VPS, pm2 + nginx)

1. Create the production database and set every variable above in the server environment.
   Create `UPLOAD_DIR` and make it writable by the app user.
2. `bun install && bun run db:migrate && bun run db:seed && bun run build`, then restart with pm2.
   Sign in and change the seeded password from **Settings**.
3. nginx must forward the client IP, or every guest shares one rate-limit bucket:
   `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`
   The app trusts only the **last** address in that header (the one nginx adds), so values a
   client sends itself are ignored. If Cloudflare or another CDN sits in front of nginx, enable
   nginx's `real_ip` module for the CDN's ranges first, otherwise the CDN's address is used.
4. Telegram is sent after the response (`after()`). Stop the app with SIGINT/SIGTERM and allow a
   10–30 s drain (pm2 `kill_timeout`) so pending notifications finish.
5. Running more than one app instance? Set the same `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` on all of them.
6. Uploads go through server actions: allow the menu PDF size in nginx, or large files fail with 413:
   `client_max_body_size 41M;` (matches `serverActions.bodySizeLimit` in `next.config.ts`).
   nginx may also serve `/media/` from `UPLOAD_DIR` directly, but keep the app route: `next/image`
   fetches images from the app itself.

A booking is always saved, even if Telegram is down; those rows have `telegram_status = 'failed'`
and the reason in `telegram_error`.
