# Podshar — architectural blueprint

A private hub for three people. Everything below follows from that one fact:
there is no growth curve to design for, no tenancy model, no moderation queue.
What there *is* instead is an unusual amount of integration surface for the size
of the audience. So the architecture optimises for **integration isolation** —
one flaky third party must never take down the homepage — and for **cheap
iteration**, because features here get built for fun and abandoned freely.

---

## 1. Shape of the system

Four processes, one database.

| Process | Runtime | Responsibility |
|---|---|---|
| `web` | Next.js 15, App Router, Node | UI, auth, REST/Server Actions, ingest endpoints |
| `realtime` | Node + `ws` | Authoritative loop for Tetris 3P, chess, Durak, poker; presence |
| `workers` | Node + BullMQ | Polling the APIs we are allowed to poll, rollups, AI enrichment |
| `scraper` | Python 3.12 + Playwright | Browser-driven collection: fashion, fragrance, real estate |

The web process never calls a third-party API during a page render. Workers and
the scraper write to Postgres; the web process reads from Postgres. That single
rule is what keeps the site fast and keeps a rate-limited provider from turning
into a 504 on the homepage.

### Why the scraper is a separate Python service

Playwright's Python bindings, `httpx`, and the parsing ecosystem are simply
better for this work than the Node equivalents, and a crashing headless browser
should not share a process with anything a user is waiting on. It talks to the
web app over one authenticated ingest endpoint (`POST /api/ingest/scraped`),
which means the scraper needs no database credentials and the schema stays owned
by Prisma alone.

---

## 2. Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | Server Components let stat-heavy pages render without shipping the fetching code |
| Language | TypeScript strict, Python 3.12 (scraper) | — |
| Styling | Tailwind, tokens only (`canvas`/`ink`/`sand`/`clay`) | Palette lives in one file; no raw hex at call sites |
| Data | PostgreSQL 16 + Prisma 6 | Relations here are genuinely relational; JSONB where payloads are provider-shaped |
| Auth | Auth.js v5, credentials + invite allowlist | Three fixed users, no public sign-up |
| i18n | `next-intl` | Locale-segment routing, server + client parity, ICU messages |
| Realtime | Standalone `ws` server, Redis pub/sub | Serverless functions cannot hold sockets |
| Jobs | BullMQ on Redis | Retries, backoff, and rate-limit groups per provider |
| Media | S3-compatible object store | Everything mirrored on ingest; nothing hotlinked |
| Secrets | External store, referenced by key from the DB | See §4 |
| PWA | `next-pwa` / Workbox | Offline shell + the dino game |
| Desktop | Tauri | Ships a ~10 MB binary against the same web build; Electron is 150 MB for no gain here |
| Deploy | One small VPS, Docker Compose, Caddy | See §5 |

---

## 3. Module map

```
Identity        invite allowlist -> credentials login -> gallery CAPTCHA
Life organizer  calendar, to-do, gym, wall of shame, weather, doomsday, SBB
Culture         meme feed, gallery + vision comments, fashion/fragrance radar, quote
Music           Spotify x2 + SoundCloud x1 -> canonical track graph -> comparison
Money & world   Ballick balances, trap-house listings, Ukraine map
Play            realtime rooms, daily puzzles, dino arcade
Stats           Dota 2 hub, Brawl Stars hub
```

Each module owns a route group, a worker queue, and a slice of the schema. None
of them import from each other; shared concepts (member, media, tag) live in
`src/lib`.

---

## 4. Cross-cutting decisions

**Auth.** Registration is gated on the `invites` table, which is seeded with
exactly three rows. There is no "sign up" path that does not consume an invite
token, so the three-user limit is a database constraint rather than a policy.
Passwords use Argon2id. Sessions are database-backed so a login can be revoked.

**The CAPTCHA.** Challenges draw only from `gallery_photos` where
`captchaSafe = true`, labelled with tags from our own vocabulary. Worth being
clear-eyed: this is not a bot defence, because a hand-rolled image CAPTCHA on a
three-person site protects nothing a rate limiter and an invite wall do not
already protect. Treat it as a doorway ritual, keep the real defences (invite
allowlist, per-IP throttling, Argon2id) doing the actual work, and never let the
CAPTCHA be the only thing between a request and an account.

**Secrets.** `MusicConnection.credentialRef` and `FinanceConnection.credentialRef`
hold pointers, not tokens. Postgres backups therefore contain no live
credentials. Exchange keys must be created read-only, without withdrawal
permission — this is the single highest-consequence rule in the project.

**Media.** Everything ingested is mirrored to object storage and recorded in
`media_assets` with a checksum. Deduplication is free, the UI never leaks our IP
addresses to a source CDN, and dead upstream links do not produce broken images
six months later.

**Realtime.** The `ws` server holds authoritative state; clients send intents,
never positions. For 3-player Tetris that means garbage-line attribution and the
shared point pool cannot be forged by a modified client. State snapshots persist
to `game_rooms.state` so a dropped connection can rejoin.

**Offline.** The service worker precaches the shell and the dino game. Scores
queue in IndexedDB with a client-generated nonce and flush on reconnect; the
`(userId, clientNonce)` unique constraint makes double-sync a no-op.

**Localisation.** Four locales, path-prefixed (`/en`, `/ru`, `/uk`, `/de`).
Both fonts carry Cyrillic, which is not optional given the greeting renders in
Russian and Ukrainian.

---

## 5. Deployment

A single VPS with a static IP, running Docker Compose behind Caddy.

This is not the fashionable answer, and it is the right one here. The Brawl
Stars API issues tokens bound to a fixed source IP; on serverless with rotating
egress addresses every poll fails. A static IP also keeps the scraper's identity
stable and puts Postgres, Redis and the socket server on the same private
network at zero cost. Three users generate load a $12 box will not notice.

---

## 6. Roadmap

Each phase ends in something usable. Nothing is scaffolded and left dark.

**Phase 0 — Foundation (done in this commit)**
Next.js + TypeScript + Tailwind tokens, four-locale routing, the homepage cover,
sidebar, assistant shell, PWA manifest, Prisma schema, seed.
*Exit:* `npm run dev` serves the cover in all four languages.

**Phase 1 — Identity**
Postgres and Redis in Compose. Auth.js credentials provider, Argon2id, invite
redemption, session-backed sidebar profile. Route protection in middleware.
*Exit:* three real accounts exist; a fourth cannot be created.

**Phase 2 — The shell becomes real**
Profile editing, avatar upload, the media pipeline and `/api/media` proxy.
Gallery upload and browsing. Gallery CAPTCHA on the login form. The search hub
is rebuilt here from scratch — the v0.3 `/hub` route was deleted in v0.4 rather
than carried forward, and the "ПХ" button navigates nowhere until it exists.
*Exit:* photos in, photos out, CAPTCHA drawing from them.

**Phase 3 — Life organizer**
Shared calendar, to-do list, gym tracker, wall of shame. Weather and Doomsday
widgets. SBB lookups with the `transit_queries` cache.
*Exit:* the app is worth opening daily.

**Phase 4 — Assistant**
Replace the keyword router in `/api/assistant` with a streaming model call that
holds the nav table as a tool and the group's tone in its prompt. Vision
comments on gallery uploads, versioned by prompt.
*Exit:* "where do I find the memes" and "roast this photo" both work.

**Phase 5 — Ingestion**
BullMQ + the Python scraper. Reddit first (it has a real API), then the meme
feed with its three categories. Then fashion and fragrance. Real estate last,
because it needs the most care.
*Exit:* feeds fill themselves overnight.

**Phase 6 — Stats**
Brawl Stars and Dota pollers, snapshot history, sidebar quick-stats wired to
live data, patch notes, bracket-scoped meta analyser.
*Exit:* the sidebar numbers are real.

**Phase 7 — Music**
Spotify OAuth for two, SoundCloud for one. Canonical track graph, rollups,
comparative dashboard, compatibility score.
*Exit:* one leaderboard across two platforms.

**Phase 8 — Play**
Realtime server, lobby, 3-player Tetris first (it is the custom one and the
hardest). Then chess, Durak, poker on the same room primitives. Daily puzzles.
Dino game with offline sync.
*Exit:* three people in one Tetris room.

**Phase 9 — Money, world, packaging**
Ballick with read-only keys. Trap-house search over the listing satellite table.
Ukraine map. Tauri desktop build. Backups and restore drill.
*Exit:* installable on phone and desktop.

---

## 7. Constraints worth knowing before you build

These do not change the plan; they change what "done" can mean.

**TikTok and Pinterest do not permit scraping.** Their terms prohibit it and
both invest in blocking it, so a Playwright scraper against them will break
repeatedly and may get the source IP banned. Reddit has a real API — build the
meme feed on it first. For TikTok, the official Display API plus manual
submission covers most of what the feed needs. Treat Pinterest boards as a
best-effort source that is expected to go dark, not as a dependency.

**Dota 2 does not expose numeric MMR.** Valve's API has never returned it.
OpenDota gives a rank tier and an estimate. The schema keeps `mmr` and
`rankTier` separate for exactly this reason; the sidebar should show what is
real, which is the tier.

**"Meccha chameleon, peak, schedule 1" have no integration surface.** They are
third-party games without public APIs. What is buildable is a co-op *hub*:
session scheduling, presence via Steam, who-owns-what, and a launcher link. Real
in-game integration is not on the table, and the roadmap treats it accordingly.

**Real-estate portals fight scrapers.** Homegate and ImmoScout24 both do. Their
own saved-search email alerts are permitted and reliable; parsing those into
`real_estate_listings` gets the same result without the arms race.

**Fiat balances.** Do not build bank credential scraping. Use an aggregator with
read-only consent, or manual entry. Crypto is easier and safer: public addresses
need no credentials at all, so prefer address-watching over exchange API keys
wherever a wallet is self-custodied.

---

## 8. Repo layout

```
src/
  app/[locale]/          routes, one folder per module
  app/api/               ingest, assistant, media proxy, auth
  components/            shared UI
  i18n/                  routing, request config, messages/{en,ru,uk,de}.json
  lib/                   session, navigation, domain helpers
prisma/                  schema.prisma, seed.ts, migrations
services/
  realtime/              ws server
  scraper/               Python + Playwright
docs/                    this file
```
