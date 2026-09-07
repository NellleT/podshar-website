import { sharedDayIndex } from '@/lib/day';

/** Messages one person may send the dog in a day. Three people; this is generous. */
const DAILY_LIMIT = 200;

const used = new Map<string, { day: number; count: number }>();

/**
 * A ceiling on what a single account can spend in a day.
 *
 * Be clear about what this is and is not. The real protection is the session
 * check on the route: only three accounts exist, so only three people can spend
 * anything at all. This is the second thing — the one that catches a client
 * stuck in a retry loop draining the balance overnight, which is the failure
 * that actually happens.
 *
 * It lives in memory, so a serverless deploy counts per instance and a restart
 * forgets. That makes it a speed bump rather than a wall, and a speed bump is
 * the right size for the problem: moving it into Postgres would mean a write on
 * every message to guard against a bill that is a few dollars at worst.
 */
export function withinDailyLimit(userId: string): boolean {
  const today = sharedDayIndex();
  const entry = used.get(userId);

  if (!entry || entry.day !== today) {
    used.set(userId, { day: today, count: 1 });
    return true;
  }

  if (entry.count >= DAILY_LIMIT) return false;
  entry.count += 1;
  return true;
}
