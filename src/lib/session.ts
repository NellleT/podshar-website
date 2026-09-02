import 'server-only';

import type { MemberProfile, QuickStats } from '@/lib/types';

/**
 * Session and quick-stat accessors.
 *
 * These are the two seams the rest of the UI reads through. Right now they
 * return fixtures so the shell runs before the database exists; in Phase 1
 * swap the bodies for Auth.js + Prisma and nothing above them changes.
 *
 *   getCurrentMember() -> auth() session -> prisma.member.findUnique(...)
 *   getQuickStats()    -> prisma.gameStatSnapshot.findFirst({ orderBy: ... })
 */

export async function getCurrentMember(): Promise<MemberProfile> {
  return {
    displayName: 'Guest',
    handle: 'guest',
    avatarUrl: null
  };
}

export async function getQuickStats(): Promise<QuickStats> {
  // `null` renders the skeleton, which is the honest state until the Dota and
  // Brawl Stars pollers have written their first snapshot.
  return {
    dotaPts: null,
    brawlCups: null
  };
}
