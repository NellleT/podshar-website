import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { prisma } from '@/lib/db';
import { SESSION_COOKIE } from '@/lib/auth/cookie';

/**
 * Sessions.
 *
 * Server-side sessions in the `auth_sessions` table, not a signed JWT. The
 * difference that matters here: a row can be deleted. Signing out, or throwing
 * someone out from another device, is a `DELETE`; with a JWT it is a wait for
 * the token to expire.
 *
 * This is also why the project no longer depends on Auth.js. Its Credentials
 * provider only supports the JWT strategy — the `Session` model already in the
 * schema would have sat unused, and sessions would have been unrevokable.
 *
 * The cookie holds 32 random bytes; the database holds their SHA-256. Read
 * access to the table therefore does not hand anyone a working session, and
 * since the token is uniformly random there is nothing to salt against — a
 * rainbow table over 2^256 is not a thing.
 */
const TTL_DAYS = 30;

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/**
 * Start a session and set the cookie.
 *
 * Server Actions and Route Handlers only — those are the only places Next
 * allows a cookie to be written.
 */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + TTL_DAYS * 86_400_000);

  await prisma.session.create({
    data: { sessionToken: sha256(token), userId, expires }
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Lax, not Strict: Strict drops the cookie when you arrive from a link in a
    // chat, which is exactly how this site gets opened.
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires
  });
}

/**
 * The signed-in user, or null.
 *
 * Wrapped in React's `cache`, so the layout and the page hitting this in the
 * same render share one query rather than two.
 */
export const readSession = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: sha256(token) },
    include: { user: true }
  });
  if (!session) return null;

  // Expired rows are deleted on sight rather than left for a cleanup job: this
  // runs on every request anyway, and there are three users, so the table can
  // keep itself tidy.
  if (session.expires.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session;
});

/** End the current session: delete the row, clear the cookie. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session
      .deleteMany({ where: { sessionToken: sha256(token) } })
      .catch(() => {});
  }

  jar.delete(SESSION_COOKIE);
}
