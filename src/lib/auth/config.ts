/**
 * Whether authentication can run at all, and what to do when it cannot.
 *
 * No imports on purpose: `middleware.ts` runs in the Edge Runtime and reads
 * this, so it must not pull in Prisma or anything that touches it.
 *
 * The distinction matters more than it looks. Early on the site had one rule —
 * "no DATABASE_URL, no checks" — so that it kept running before the database
 * existed. On a laptop that is convenience. On a deployment it is a private
 * site for three people serving itself to the entire internet, because a
 * missing environment variable silently disables every gate.
 *
 * So the rule is now asymmetric, which is the whole point:
 *
 *   development, no database   open. Nothing to protect, nobody can reach it.
 *   production,  no database   closed. A misconfigured deploy locks people out
 *                              rather than letting everyone in — a broken site
 *                              is a bad afternoon, an open one is a leak.
 *   any,         database      the real check runs.
 */

/** True when there is a database to authenticate against. */
export const authConfigured = () => Boolean(process.env.DATABASE_URL);

/**
 * True only when the site may be browsed without signing in.
 *
 * Never true in production. Fail closed.
 */
export const guestModeAllowed = () =>
  process.env.NODE_ENV !== 'production' && !authConfigured();
