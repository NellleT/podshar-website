import 'server-only';

import { prisma } from '@/lib/db';
import { readSession } from '@/lib/auth/session';
import type { MemberProfile, QuickStats } from '@/lib/types';

/**
 * Session and quick-stat accessors.
 *
 * These are the two seams the rest of the UI reads through, and they still are:
 * every caller above this file is unchanged from when both returned fixtures.
 *
 * Guest mode is deliberate and load-bearing. Until `DATABASE_URL` is set there
 * is no database to ask, and the site has to keep running anyway — it is a
 * public-facing shell that simply has nobody signed in. That is also the
 * honest state of a signed-out visitor once auth is switched on, so it is one
 * code path rather than a temporary scaffold.
 */

const GUEST: MemberProfile = {
  displayName: 'Guest',
  handle: 'guest',
  avatarUrl: null
};

/** True once a database is configured. Cheap, and it avoids a connect attempt
 *  (and its multi-second timeout) on every render while the URL is missing. */
const hasDatabase = () => Boolean(process.env.DATABASE_URL);

export async function getCurrentMember(): Promise<MemberProfile> {
  if (!hasDatabase()) return GUEST;

  const session = await readSession();
  if (!session) return GUEST;

  const { user } = session;
  return {
    displayName: user.displayName,
    handle: user.handle,
    // Avatars arrive with the media pipeline; the column is a reference into
    // `media_assets`, not a URL, so resolving it is a separate join later.
    avatarUrl: null
  };
}

/**
 * The two numbers in the drawer.
 *
 * `null` renders the skeleton, which is the honest state until the Dota and
 * Brawl Stars pollers have written their first snapshot — and also the state
 * for a signed-out visitor, who has no stats to show.
 */
export async function getQuickStats(): Promise<QuickStats> {
  if (!hasDatabase()) return { dotaPts: null, brawlCups: null };

  const session = await readSession();
  if (!session) return { dotaPts: null, brawlCups: null };

  // Newest row per game. The snapshot tables are append-only time series, so
  // "current value" is always `orderBy: capturedAt desc, take: 1`.
  //
  // Snapshots hang off `GameAccount`, not off the user — one person can have
  // more than one account per game — so the filter goes through the relation.
  const newest = (game: 'DOTA2' | 'BRAWL_STARS') =>
    prisma.gameStatSnapshot.findFirst({
      where: { game, account: { userId: session.userId } },
      orderBy: { capturedAt: 'desc' }
    });

  const [dota, brawl] = await Promise.all([newest('DOTA2'), newest('BRAWL_STARS')]);

  return {
    dotaPts: dota?.mmr ?? null,
    brawlCups: brawl?.cups ?? null
  };
}
