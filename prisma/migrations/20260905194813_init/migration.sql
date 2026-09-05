-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'ru', 'uk', 'de');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ScrapeSource" AS ENUM ('REDDIT', 'TIKTOK', 'PINTEREST', 'FRAGRANTICA', 'HOMEGATE', 'IMMOSCOUT', 'FLATFOX', 'WEB');

-- CreateEnum
CREATE TYPE "ScrapedKind" AS ENUM ('MEME', 'FASHION_LOOK', 'FRAGRANCE', 'REAL_ESTATE');

-- CreateEnum
CREATE TYPE "MemeCategory" AS ENUM ('POPULAR', 'NEW', 'NICHE');

-- CreateEnum
CREATE TYPE "ScrapeStatus" AS ENUM ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO', 'GIF', 'AUDIO');

-- CreateEnum
CREATE TYPE "MusicProvider" AS ENUM ('SPOTIFY', 'SOUNDCLOUD');

-- CreateEnum
CREATE TYPE "FinanceKind" AS ENUM ('FIAT', 'CRYPTO');

-- CreateEnum
CREATE TYPE "TrackedGame" AS ENUM ('DOTA2', 'BRAWL_STARS');

-- CreateEnum
CREATE TYPE "MatchResult" AS ENUM ('WIN', 'LOSS', 'DRAW');

-- CreateEnum
CREATE TYPE "RoomGame" AS ENUM ('TETRIS_3P', 'CHESS', 'DURAK', 'POKER');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('LOBBY', 'ACTIVE', 'FINISHED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PuzzleKind" AS ENUM ('WORDLE', 'DOTADLE', 'BRAWLSTARSDLE');

-- CreateEnum
CREATE TYPE "ArcadeGame" AS ENUM ('DINO');

-- CreateEnum
CREATE TYPE "PoiKind" AS ENUM ('IKEA', 'SWISSCOM', 'SCHOOL', 'OTHER');

-- CreateEnum
CREATE TYPE "AttendeeStatus" AS ENUM ('GOING', 'MAYBE', 'DECLINED');

-- CreateEnum
CREATE TYPE "PropertyKind" AS ENUM ('ROOM_3', 'STUDIO', 'HOUSE', 'BASEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "RollupDimension" AS ENUM ('TRACK', 'ARTIST', 'GENRE');

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "locale" "Locale" NOT NULL DEFAULT 'en',
    "avatarId" TEXT,
    "timeZone" TEXT NOT NULL DEFAULT 'Europe/Zurich',
    "homeLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "captcha_challenges" (
    "id" TEXT NOT NULL,
    "promptTagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "ipHash" TEXT,

    CONSTRAINT "captcha_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "captcha_challenge_options" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "captcha_challenge_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "durationMs" INTEGER,
    "blurhash" TEXT,
    "checksum" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "uploaderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_photos" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "caption" TEXT,
    "takenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "captchaSafe" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "gallery_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_photo_tags" (
    "photoId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "gallery_photo_tags_pkey" PRIMARY KEY ("photoId","tagId")
);

-- CreateTable
CREATE TABLE "gallery_ai_comments" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "text" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_ai_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_runs" (
    "id" TEXT NOT NULL,
    "source" "ScrapeSource" NOT NULL,
    "kind" "ScrapedKind" NOT NULL,
    "status" "ScrapeStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "itemsSeen" INTEGER NOT NULL DEFAULT 0,
    "itemsNew" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "scrape_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scraped_items" (
    "id" TEXT NOT NULL,
    "kind" "ScrapedKind" NOT NULL,
    "source" "ScrapeSource" NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "runId" TEXT,
    "payload" JSONB,

    CONSTRAINT "scraped_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scraped_item_media" (
    "itemId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "scraped_item_media_pkey" PRIMARY KEY ("itemId","mediaId")
);

-- CreateTable
CREATE TABLE "scraped_item_tags" (
    "itemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "scraped_item_tags_pkey" PRIMARY KEY ("itemId","tagId")
);

-- CreateTable
CREATE TABLE "meme_items" (
    "itemId" TEXT NOT NULL,
    "category" "MemeCategory" NOT NULL,
    "language" TEXT,
    "subreddit" TEXT,
    "soundId" TEXT,

    CONSTRAINT "meme_items_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "fashion_looks" (
    "itemId" TEXT NOT NULL,
    "aesthetic" TEXT NOT NULL,
    "season" TEXT,
    "boardUrl" TEXT,

    CONSTRAINT "fashion_looks_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "fragrance_items" (
    "itemId" TEXT NOT NULL,
    "house" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "persona" TEXT,
    "accords" TEXT[],
    "longevityScore" DOUBLE PRECISION,
    "complimentScore" DOUBLE PRECISION,
    "nicheScore" DOUBLE PRECISION,
    "priceEur" DECIMAL(10,2),

    CONSTRAINT "fragrance_items_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "real_estate_listings" (
    "itemId" TEXT NOT NULL,
    "kind" "PropertyKind" NOT NULL,
    "rooms" DECIMAL(3,1),
    "areaSqm" INTEGER,
    "priceChf" DECIMAL(10,2),
    "street" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "availableFrom" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "real_estate_listings_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "music_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "MusicProvider" NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "credentialRef" TEXT NOT NULL,
    "scope" TEXT,
    "expiresAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "music_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artists" (
    "id" TEXT NOT NULL,
    "canonicalKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_genres" (
    "artistId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "artist_genres_pkey" PRIMARY KEY ("artistId","genreId")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" TEXT NOT NULL,
    "canonicalKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "isrc" TEXT,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_provider_refs" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "provider" "MusicProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "track_provider_refs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "provider" "MusicProvider" NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "msPlayed" INTEGER,
    "externalId" TEXT NOT NULL,

    CONSTRAINT "play_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listening_rollups" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "dimension" "RollupDimension" NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "trackId" TEXT,
    "artistId" TEXT,
    "genreId" TEXT,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "msPlayed" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "listening_rollups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compatibility_scores" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "breakdown" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compatibility_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "FinanceKind" NOT NULL,
    "provider" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "externalRef" TEXT,
    "credentialRef" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_snapshots" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "amount" DECIMAL(38,18) NOT NULL,
    "fiatValue" DECIMAL(18,2),
    "fiatCurrency" TEXT NOT NULL DEFAULT 'CHF',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "game" "TrackedGame" NOT NULL,
    "externalId" TEXT NOT NULL,
    "tag" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_stat_snapshots" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "game" "TrackedGame" NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mmr" INTEGER,
    "rankTier" TEXT,
    "cups" INTEGER,
    "highestCups" INTEGER,
    "winRate" DOUBLE PRECISION,
    "payload" JSONB,

    CONSTRAINT "game_stat_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_records" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "game" "TrackedGame" NOT NULL,
    "externalMatchId" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "result" "MatchResult" NOT NULL,
    "character" TEXT,
    "durationSec" INTEGER,
    "ratingDelta" INTEGER,
    "payload" JSONB,

    CONSTRAINT "match_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patch_notes" (
    "id" TEXT NOT NULL,
    "game" "TrackedGame" NOT NULL,
    "version" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "summary" TEXT,

    CONSTRAINT "patch_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_hero_stats" (
    "id" TEXT NOT NULL,
    "game" "TrackedGame" NOT NULL,
    "heroKey" TEXT NOT NULL,
    "bracket" TEXT NOT NULL,
    "patch" TEXT NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "pickRate" DOUBLE PRECISION NOT NULL,
    "banRate" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meta_hero_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_rooms" (
    "id" TEXT NOT NULL,
    "game" "RoomGame" NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'LOBBY',
    "createdById" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "state" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "game_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_participants" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seat" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "placement" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_puzzles" (
    "id" TEXT NOT NULL,
    "kind" "PuzzleKind" NOT NULL,
    "puzzleDate" DATE NOT NULL,
    "answerHash" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "payload" JSONB,

    CONSTRAINT "daily_puzzles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puzzle_attempts" (
    "id" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guesses" JSONB NOT NULL,
    "solved" BOOLEAN NOT NULL DEFAULT false,
    "guessCount" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puzzle_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arcade_scores" (
    "id" TEXT NOT NULL,
    "game" "ArcadeGame" NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "clientNonce" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arcade_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "stopId" TEXT,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_of_interest" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "PoiKind" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "stopId" TEXT,

    CONSTRAINT "points_of_interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transit_queries" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "departAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "itineraries" JSONB NOT NULL,

    CONSTRAINT "transit_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_snapshots" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tempC" DOUBLE PRECISION NOT NULL,
    "feelsLikeC" DOUBLE PRECISION,
    "code" TEXT NOT NULL,
    "windKph" DOUBLE PRECISION,
    "payload" JSONB,

    CONSTRAINT "weather_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countdowns" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "targetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countdowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "rrule" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AttendeeStatus" NOT NULL DEFAULT 'GOING',

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("eventId","userId")
);

-- CreateTable
CREATE TABLE "todo_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "position" DOUBLE PRECISION NOT NULL,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todo_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "focus" TEXT,
    "notes" TEXT,

    CONSTRAINT "gym_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shame_entries" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shame_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shame_reactions" (
    "entryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,

    CONSTRAINT "shame_reactions_pkey" PRIMARY KEY ("entryId","userId","emoji")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "attribution" TEXT,
    "locale" "Locale" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_of_the_day" (
    "id" TEXT NOT NULL,
    "showOn" DATE NOT NULL,
    "quoteId" TEXT NOT NULL,

    CONSTRAINT "quote_of_the_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_handle_key" ON "members"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "members_avatarId_key" ON "members"("avatarId");

-- CreateIndex
CREATE UNIQUE INDEX "invites_email_key" ON "invites"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invites_handle_key" ON "invites"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "invites_tokenHash_key" ON "invites"("tokenHash");

-- CreateIndex
CREATE INDEX "auth_accounts_userId_idx" ON "auth_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_provider_providerAccountId_key" ON "auth_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_sessionToken_key" ON "auth_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "auth_sessions_userId_idx" ON "auth_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_verification_tokens_token_key" ON "auth_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "auth_verification_tokens_identifier_token_key" ON "auth_verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "captcha_challenges_expiresAt_idx" ON "captcha_challenges"("expiresAt");

-- CreateIndex
CREATE INDEX "captcha_challenge_options_challengeId_idx" ON "captcha_challenge_options"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "captcha_challenge_options_challengeId_position_key" ON "captcha_challenge_options"("challengeId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storageKey_key" ON "media_assets"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_checksum_key" ON "media_assets"("checksum");

-- CreateIndex
CREATE INDEX "media_assets_kind_createdAt_idx" ON "media_assets"("kind", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_namespace_idx" ON "tags"("namespace");

-- CreateIndex
CREATE UNIQUE INDEX "gallery_photos_mediaId_key" ON "gallery_photos"("mediaId");

-- CreateIndex
CREATE INDEX "gallery_photos_createdAt_idx" ON "gallery_photos"("createdAt");

-- CreateIndex
CREATE INDEX "gallery_photos_captchaSafe_idx" ON "gallery_photos"("captchaSafe");

-- CreateIndex
CREATE INDEX "gallery_ai_comments_photoId_idx" ON "gallery_ai_comments"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "gallery_ai_comments_photoId_locale_promptVersion_key" ON "gallery_ai_comments"("photoId", "locale", "promptVersion");

-- CreateIndex
CREATE INDEX "scrape_runs_source_kind_startedAt_idx" ON "scrape_runs"("source", "kind", "startedAt");

-- CreateIndex
CREATE INDEX "scraped_items_kind_score_idx" ON "scraped_items"("kind", "score");

-- CreateIndex
CREATE INDEX "scraped_items_kind_publishedAt_idx" ON "scraped_items"("kind", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "scraped_items_source_externalId_key" ON "scraped_items"("source", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "scraped_item_media_itemId_position_key" ON "scraped_item_media"("itemId", "position");

-- CreateIndex
CREATE INDEX "meme_items_category_idx" ON "meme_items"("category");

-- CreateIndex
CREATE INDEX "fashion_looks_aesthetic_idx" ON "fashion_looks"("aesthetic");

-- CreateIndex
CREATE INDEX "fragrance_items_house_name_idx" ON "fragrance_items"("house", "name");

-- CreateIndex
CREATE INDEX "fragrance_items_complimentScore_idx" ON "fragrance_items"("complimentScore");

-- CreateIndex
CREATE INDEX "real_estate_listings_kind_priceChf_idx" ON "real_estate_listings"("kind", "priceChf");

-- CreateIndex
CREATE INDEX "real_estate_listings_city_street_idx" ON "real_estate_listings"("city", "street");

-- CreateIndex
CREATE INDEX "real_estate_listings_isActive_availableFrom_idx" ON "real_estate_listings"("isActive", "availableFrom");

-- CreateIndex
CREATE UNIQUE INDEX "music_connections_userId_provider_key" ON "music_connections"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "music_connections_provider_externalUserId_key" ON "music_connections"("provider", "externalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "artists_canonicalKey_key" ON "artists"("canonicalKey");

-- CreateIndex
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_canonicalKey_key" ON "tracks"("canonicalKey");

-- CreateIndex
CREATE INDEX "tracks_artistId_idx" ON "tracks"("artistId");

-- CreateIndex
CREATE INDEX "track_provider_refs_trackId_idx" ON "track_provider_refs"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "track_provider_refs_provider_externalId_key" ON "track_provider_refs"("provider", "externalId");

-- CreateIndex
CREATE INDEX "play_events_userId_playedAt_idx" ON "play_events"("userId", "playedAt");

-- CreateIndex
CREATE INDEX "play_events_trackId_playedAt_idx" ON "play_events"("trackId", "playedAt");

-- CreateIndex
CREATE UNIQUE INDEX "play_events_userId_provider_externalId_key" ON "play_events"("userId", "provider", "externalId");

-- CreateIndex
CREATE INDEX "listening_rollups_period_periodStart_dimension_idx" ON "listening_rollups"("period", "periodStart", "dimension");

-- CreateIndex
CREATE UNIQUE INDEX "listening_rollups_userId_period_periodStart_dimension_dimen_key" ON "listening_rollups"("userId", "period", "periodStart", "dimension", "dimensionId");

-- CreateIndex
CREATE UNIQUE INDEX "compatibility_scores_period_periodStart_key" ON "compatibility_scores"("period", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "finance_connections_userId_provider_label_key" ON "finance_connections"("userId", "provider", "label");

-- CreateIndex
CREATE INDEX "balance_snapshots_connectionId_capturedAt_idx" ON "balance_snapshots"("connectionId", "capturedAt");

-- CreateIndex
CREATE INDEX "game_accounts_userId_idx" ON "game_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "game_accounts_game_externalId_key" ON "game_accounts"("game", "externalId");

-- CreateIndex
CREATE INDEX "game_stat_snapshots_accountId_capturedAt_idx" ON "game_stat_snapshots"("accountId", "capturedAt");

-- CreateIndex
CREATE INDEX "match_records_accountId_playedAt_idx" ON "match_records"("accountId", "playedAt");

-- CreateIndex
CREATE UNIQUE INDEX "match_records_accountId_externalMatchId_key" ON "match_records"("accountId", "externalMatchId");

-- CreateIndex
CREATE INDEX "patch_notes_game_releasedAt_idx" ON "patch_notes"("game", "releasedAt");

-- CreateIndex
CREATE UNIQUE INDEX "patch_notes_game_version_key" ON "patch_notes"("game", "version");

-- CreateIndex
CREATE INDEX "meta_hero_stats_game_bracket_winRate_idx" ON "meta_hero_stats"("game", "bracket", "winRate");

-- CreateIndex
CREATE UNIQUE INDEX "meta_hero_stats_game_heroKey_bracket_patch_key" ON "meta_hero_stats"("game", "heroKey", "bracket", "patch");

-- CreateIndex
CREATE INDEX "game_rooms_game_status_idx" ON "game_rooms"("game", "status");

-- CreateIndex
CREATE UNIQUE INDEX "game_participants_roomId_userId_key" ON "game_participants"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "game_participants_roomId_seat_key" ON "game_participants"("roomId", "seat");

-- CreateIndex
CREATE UNIQUE INDEX "daily_puzzles_kind_puzzleDate_key" ON "daily_puzzles"("kind", "puzzleDate");

-- CreateIndex
CREATE UNIQUE INDEX "puzzle_attempts_puzzleId_userId_key" ON "puzzle_attempts"("puzzleId", "userId");

-- CreateIndex
CREATE INDEX "arcade_scores_game_score_idx" ON "arcade_scores"("game", "score");

-- CreateIndex
CREATE UNIQUE INDEX "arcade_scores_userId_clientNonce_key" ON "arcade_scores"("userId", "clientNonce");

-- CreateIndex
CREATE INDEX "points_of_interest_kind_idx" ON "points_of_interest"("kind");

-- CreateIndex
CREATE INDEX "transit_queries_fromId_toId_departAt_idx" ON "transit_queries"("fromId", "toId", "departAt");

-- CreateIndex
CREATE INDEX "transit_queries_expiresAt_idx" ON "transit_queries"("expiresAt");

-- CreateIndex
CREATE INDEX "weather_snapshots_locationId_capturedAt_idx" ON "weather_snapshots"("locationId", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "countdowns_key_key" ON "countdowns"("key");

-- CreateIndex
CREATE INDEX "calendar_events_startsAt_idx" ON "calendar_events"("startsAt");

-- CreateIndex
CREATE INDEX "todo_items_done_position_idx" ON "todo_items"("done", "position");

-- CreateIndex
CREATE INDEX "todo_items_assigneeId_idx" ON "todo_items"("assigneeId");

-- CreateIndex
CREATE INDEX "gym_sessions_userId_scheduledFor_idx" ON "gym_sessions"("userId", "scheduledFor");

-- CreateIndex
CREATE INDEX "shame_entries_targetId_createdAt_idx" ON "shame_entries"("targetId", "createdAt");

-- CreateIndex
CREATE INDEX "shame_entries_createdAt_idx" ON "shame_entries"("createdAt");

-- CreateIndex
CREATE INDEX "quotes_locale_idx" ON "quotes"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "quote_of_the_day_showOn_key" ON "quote_of_the_day"("showOn");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_homeLocationId_fkey" FOREIGN KEY ("homeLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captcha_challenges" ADD CONSTRAINT "captcha_challenges_promptTagId_fkey" FOREIGN KEY ("promptTagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captcha_challenge_options" ADD CONSTRAINT "captcha_challenge_options_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "captcha_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captcha_challenge_options" ADD CONSTRAINT "captcha_challenge_options_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "gallery_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photo_tags" ADD CONSTRAINT "gallery_photo_tags_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "gallery_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photo_tags" ADD CONSTRAINT "gallery_photo_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_ai_comments" ADD CONSTRAINT "gallery_ai_comments_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "gallery_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scraped_items" ADD CONSTRAINT "scraped_items_runId_fkey" FOREIGN KEY ("runId") REFERENCES "scrape_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scraped_item_media" ADD CONSTRAINT "scraped_item_media_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "scraped_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scraped_item_media" ADD CONSTRAINT "scraped_item_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scraped_item_tags" ADD CONSTRAINT "scraped_item_tags_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "scraped_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scraped_item_tags" ADD CONSTRAINT "scraped_item_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meme_items" ADD CONSTRAINT "meme_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "scraped_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fashion_looks" ADD CONSTRAINT "fashion_looks_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "scraped_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fragrance_items" ADD CONSTRAINT "fragrance_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "scraped_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "real_estate_listings" ADD CONSTRAINT "real_estate_listings_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "scraped_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "music_connections" ADD CONSTRAINT "music_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_genres" ADD CONSTRAINT "artist_genres_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_genres" ADD CONSTRAINT "artist_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_provider_refs" ADD CONSTRAINT "track_provider_refs_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_events" ADD CONSTRAINT "play_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_events" ADD CONSTRAINT "play_events_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_rollups" ADD CONSTRAINT "listening_rollups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_rollups" ADD CONSTRAINT "listening_rollups_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_rollups" ADD CONSTRAINT "listening_rollups_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_rollups" ADD CONSTRAINT "listening_rollups_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_connections" ADD CONSTRAINT "finance_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "finance_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_accounts" ADD CONSTRAINT "game_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_stat_snapshots" ADD CONSTRAINT "game_stat_snapshots_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "game_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_records" ADD CONSTRAINT "match_records_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "game_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_rooms" ADD CONSTRAINT "game_rooms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "game_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puzzle_attempts" ADD CONSTRAINT "puzzle_attempts_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "daily_puzzles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puzzle_attempts" ADD CONSTRAINT "puzzle_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arcade_scores" ADD CONSTRAINT "arcade_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transit_queries" ADD CONSTRAINT "transit_queries_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transit_queries" ADD CONSTRAINT "transit_queries_toId_fkey" FOREIGN KEY ("toId") REFERENCES "points_of_interest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_snapshots" ADD CONSTRAINT "weather_snapshots_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_sessions" ADD CONSTRAINT "gym_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shame_entries" ADD CONSTRAINT "shame_entries_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shame_entries" ADD CONSTRAINT "shame_entries_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shame_entries" ADD CONSTRAINT "shame_entries_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shame_reactions" ADD CONSTRAINT "shame_reactions_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "shame_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shame_reactions" ADD CONSTRAINT "shame_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_of_the_day" ADD CONSTRAINT "quote_of_the_day_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
