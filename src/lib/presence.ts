import 'server-only';

import { prisma } from '@/lib/db';
import { authConfigured } from '@/lib/auth/config';
import type { PresenceEntry } from '@/lib/types';

/**
 * Who has been on the site, and how recently.
 *
 * Built on `users.lastSeenAt`, which the schema has carried from the start and
 * nothing ever wrote to — so this needs no migration, only a writer. The
 * writer is the heartbeat in `components/Presence.tsx`, which pings
 * `/api/presence` while a signed-in tab is actually in front of someone.
 *
 * "Here" is decided in the browser, not stored: a flag in the database would
 * have to be cleared when somebody leaves, and closing a tab does not reliably
 * tell anyone. A timestamp simply goes stale, which is the truth.
 */

/**
 * Writes closer together than this are skipped.
 *
 * The heartbeat is 45 seconds, but a reload, a second tab and a tab coming back
 * into view all beat as well. There are three people; the row does not need to
 * be rewritten more than twice a minute to be accurate to the minute.
 */
const TOUCH_EVERY_MS = 30_000;

/** A signed-out development run has nobody to list but the guest looking at it. */
const GUEST: PresenceEntry = { handle: 'guest', displayName: 'Guest', avatarPreset: null, lastSeen: null };

export async function listPresence(): Promise<PresenceEntry[]> {
  if (!authConfigured()) return [{ ...GUEST, lastSeen: Date.now() }];

  try {
    const users = await prisma.user.findMany({
      select: { handle: true, displayName: true, avatarPreset: true, lastSeenAt: true },
      orderBy: { lastSeenAt: { sort: 'desc', nulls: 'last' } }
    });
    return users.map((user) => ({
      handle: user.handle,
      displayName: user.displayName,
      avatarPreset: user.avatarPreset,
      lastSeen: user.lastSeenAt ? user.lastSeenAt.getTime() : null
    }));
  } catch (error) {
    // The tile falls back to showing only you. Worth a line in the log: an
    // empty "who is here" that is really a broken query looks exactly like
    // everyone else being offline.
    console.warn('[podshar] presence unavailable:', error);
    return [];
  }
}

/**
 * Note that this person is here.
 *
 * `updateMany` with the staleness in the filter, not a read followed by a
 * write: the skip costs no extra query, and two tabs beating at once cannot
 * both decide the row is stale.
 */
export async function touchPresence(userId: string): Promise<void> {
  const now = new Date();
  await prisma.user.updateMany({
    where: {
      id: userId,
      OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: new Date(now.getTime() - TOUCH_EVERY_MS) } }]
    },
    data: { lastSeenAt: now }
  });
}
