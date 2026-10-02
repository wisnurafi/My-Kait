# My-Kait

**Ship Discord messages like you ship code.**

My-Kait is a webhook studio for Discord: compose rich messages in a visual editor, preview them exactly as they'll appear, and send them through your webhooks — no bot required. Save reusable templates, monitor webhook health, and browse templates shared by the community.

## Features

- **Visual composer** — write plain text, embeds, or both, with a live Discord-style preview
- **Template library** — save messages as templates, organize with folders and tags, full-text search
- **Template variables** — dynamic placeholders like `{tanggal}`, `{waktu}`, `{hari}`, `{bulan}`, `{tahun}` (ID/EN aware)
- **Share links & public gallery** — share any template with a link, or browse community templates without logging in
- **Webhook manager** — add webhooks, automatic health checks, ping history, and down/recovered alerts
- **Message logs** — every send logged with status, latency, and payload; resend, edit, or delete from the log
- **Dashboard** — delivery stats, success rate, per-webhook breakdown
- **Command palette** — press `Ctrl/⌘+K` to jump anywhere or trigger actions
- **Bilingual** — full English / Bahasa Indonesia UI
- **Dark-first design** — precise devtool aesthetic with independent landing/app themes

## Tech stack

| Layer      | Choice                                                              |
| ---------- | ------------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router), React 19             |
| Styling    | Tailwind CSS v4, custom design tokens                               |
| Database   | PostgreSQL ([Neon](https://neon.tech)) via [Drizzle ORM](https://orm.drizzle.team) |
| Auth       | [Auth.js](https://authjs.dev) with Discord OAuth                    |
| i18n       | [next-intl](https://next-intl.dev) (`id` default, `en`)              |
| Rate limit | [Upstash Redis](https://upstash.com) (optional, skipped when unset) |
| Uploads    | [Vercel Blob](https://vercel.com/storage/blob)                      |
| Fonts      | Space Grotesk / Inter / JetBrains Mono                              |

## Getting started

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 12+
- A PostgreSQL database ([Neon](https://neon.tech) works out of the box)
- A Discord application for OAuth ([discord.com/developers/applications](https://discord.com/developers/applications))

### 1. Clone and install

```bash
git clone https://github.com/wisnurafi/My-Kait.git
cd My-Kait
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` (every variable is documented in `.env.example`):

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | ✅ | Discord OAuth app |
| `AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `AUTH_URL` | ✅ | `http://localhost:3000` for dev |
| `DATABASE_URL` | ✅ | Pooled Postgres connection string |
| `WEBHOOK_ENCRYPTION_KEY` | ✅ | `openssl rand -hex 32` (64 hex chars) — encrypts stored webhook URLs |
| `WEBHOOK_ENCRYPTION_KEY_VERSION` | ✅ | `1` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | ➖ | Rate limiting; disabled when unset |
| `BLOB_READ_WRITE_TOKEN` | ➖ | Vercel Blob, for image uploads |
| `CRON_SECRET` | ➖ | Protects `/api/cron/*` endpoints |

Add `http://localhost:3000/api/auth/callback/discord` as a redirect URI in your Discord app's OAuth2 settings.

### 3. Set up the database

```bash
pnpm db:push
```

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| ------- | ------------ |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm db:generate` | Generate a Drizzle migration |
| `pnpm db:push` | Push schema to the database |
| `pnpm db:studio` | Open Drizzle Studio |

## Project structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx            # Public landing page
│   │   ├── gallery/            # Public template gallery (no login)
│   │   ├── t/[slug]/           # Public shared-template view
│   │   └── (app)/              # Authenticated app (dashboard, editor, …)
│   └── api/
│       ├── stats/              # Public aggregate stats (cached 5 min)
│       └── cron/               # Scheduled jobs (health-check, cleanup)
├── components/                 # UI: landing, app, editor, templates, …
├── server/actions/             # Server actions (templates, webhooks, logs, …)
├── lib/                        # db, auth, crypto, discord, validations
└── messages/                   # i18n strings (en.json, id.json)
```

## API

- `GET /api/stats` — public platform aggregates (`totalMessages`, `deliveryRate`, `medianLatencyMs`), cached for 5 minutes. Powers the landing page stats strip.

## Security notes

- Webhook URLs are encrypted at rest (AES) and never exposed to other users.
- Share links are unguessable slugs; revoke anytime from the template page.
- Report abusive public templates from the share page.

## Contributing

Issues and pull requests are welcome. Keep it simple: one focused change per PR, `pnpm tsc --noEmit` must pass.

## License

[MIT](LICENSE) — use it, fork it, sell it, just keep the copyright notice.
