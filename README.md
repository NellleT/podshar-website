# Podshar

A private hub for three people. Next.js 15, TypeScript, Tailwind, PostgreSQL,
four locales, installable as a PWA and packageable to desktop via Tauri.

The design language is a premium digital fashion lookbook: four colours, two
typefaces, hairlines instead of boxes, and one piece of filled type per screen.

## Status

**Phase 0 is complete.** The design system, four-locale routing, the homepage
cover, the push drawer, the assistant column and the full database schema are
in place and running. Everything behind the ПХ seal is a placeholder index.

The ten-phase roadmap, the architecture, and the integration constraints worth
knowing before building live in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting started

Requires Node 20.11 or newer. Postgres is **not** needed to run the homepage —
the profile and stat seams return fixtures until Phase 1.

```bash
cp .env.example .env      # fill in DATABASE_URL and AUTH_SECRET before DB work
npm install
npx prisma generate       # npm 11 blocks postinstall scripts, so run this once
npm run dev
```

Open <http://localhost:3000>. The root path redirects on `Accept-Language`;
`/en`, `/ru`, `/uk` and `/de` all work directly.

For database work:

```bash
npm run db:push           # or db:migrate once migrations exist
npm run db:seed           # prints the three invite tokens, once
```

Invite tokens are printed a single time and only their hash is stored. Hand
each person their token out of band — registration accepts nothing else, which
is what keeps the app at exactly three users.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Next dev server on port 3000 |
| `npm run build` | `prisma generate` then a production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Push the schema to Postgres without a migration |
| `npm run db:seed` | Seed invites, home location, POIs, the Doomsday countdown |
| `npm run db:studio` | Prisma Studio |

## Layout

```
src/
  app/[locale]/          routes, one folder per module
  app/api/               assistant, ingest, media proxy, auth
  components/            shared UI
  i18n/                  routing, request config, messages/{en,ru,uk,de}.json
  lib/                   session, navigation, shared types
prisma/                  schema.prisma, seed.ts
services/                realtime (ws) and scraper (Python) — Phase 5 and 8
docs/ARCHITECTURE.md     blueprint, roadmap, constraints
```

The shell is three columns. `AppShell` owns the grid: the left drawer is a flex
sibling whose width animates from zero, so opening it **pushes** the canvas
rather than floating over it. Below `lg` the canvas keeps `min-w-full` and
slides off to the right like a real drawer; at `lg` it gives up width instead
and the greeting re-centres.

## Design tokens

Four colours, defined once in [tailwind.config.ts](tailwind.config.ts) and used
by name everywhere.

| Token | Value | Role |
|---|---|---|
| `canvas` | `#f7efe5` | Ground |
| `ink` | `#7b5246` | Text and hairlines |
| `sand` | `#D8C3B1` | Fills, resting accent |
| `clay` | `#A88B7D` | Active states, borders, inverted text ground |

Shadows, panel widths and the shared easing are tokens too. Never write a raw
hex value or a magic layout number in a component: adding a colour means adding
a token, and that friction is what keeps the palette this small.

Both typefaces carry Cyrillic, which is not optional here — the greeting renders
in Russian and Ukrainian, and a fallback face mid-word would wreck the one piece
of typography the cover is built around.

## Localisation

Four locales, path-prefixed, via `next-intl`. Message catalogues are one JSON
file per locale under `src/i18n/messages/`, and they are kept at exact key
parity. Adding a destination means touching `src/lib/navigation.ts` plus those
four files and nothing else.

## Before you build the integrations

Five constraints change what "done" can mean. They are covered in full in the
architecture doc, in short:

- **TikTok and Pinterest prohibit scraping.** Build the meme feed on Reddit's
  API first; treat Pinterest as a source expected to go dark.
- **Dota 2 does not expose numeric MMR.** Show the rank tier, which is real.
- **The casual co-op games have no public API.** Build scheduling and presence
  around them, not integration.
- **Real-estate portals fight scrapers.** Parse their own saved-search email
  alerts instead.
- **Ballick is the highest-consequence feature.** Read-only keys with
  withdrawal disabled, and prefer watching public addresses over holding keys.

## Licence

Private. Not for distribution.
