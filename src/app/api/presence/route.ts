import { NextResponse } from 'next/server';

import { guestModeAllowed } from '@/lib/auth/config';
import { readSession } from '@/lib/auth/session';
import { listPresence, touchPresence } from '@/lib/presence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The heartbeat: "I am here", answered with where everyone else is.
 *
 * One request does both, so the tile on the homepage needs no polling of its
 * own — it listens for the answers the heartbeat already gets.
 *
 * Behind the session like `/api/assistant`, and for a sharper reason: this
 * answers "when was each of the three last online", which is nobody's business
 * outside the three. Failing to read a session is treated as having none, so a
 * broken database closes the door rather than opening it.
 */
export async function POST() {
  if (guestModeAllowed()) {
    return NextResponse.json({ people: await listPresence(), now: Date.now() });
  }

  const session = await readSession().catch(() => null);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    await touchPresence(session.userId);
  } catch (error) {
    // Still answer with the list: a missed write costs one beat of accuracy,
    // an error response costs the whole tile.
    console.warn('[podshar] presence write failed:', error);
  }

  return NextResponse.json({ people: await listPresence(), now: Date.now() });
}
