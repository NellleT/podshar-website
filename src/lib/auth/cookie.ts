/**
 * The session cookie's name, and nothing else.
 *
 * Deliberately its own module with no imports. `middleware.ts` runs in the Edge
 * Runtime, where Prisma cannot load at all, so it must not reach into
 * `auth/session.ts` — importing that file would drag in the client and break
 * the whole middleware. Middleware only ever needs to know whether the cookie
 * is present; that is all this file gives it.
 */
export const SESSION_COOKIE = 'podshar_session';
