import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';
import { SESSION_COOKIE } from './lib/auth/cookie';
import { guestModeAllowed } from './lib/auth/config';

const handleI18n = createMiddleware(routing);

/**
 * Pages a signed-out visitor is allowed to reach, after the locale prefix.
 *
 * `reset` belongs here for the same reason as `login`: the only person who ever
 * needs it is by definition unable to sign in. Left out, the password reset is
 * not merely awkward — it is unreachable, and nothing in a type check or a
 * build says so, because the page itself is perfectly correct.
 */
const PUBLIC = /^\/(login|join|reset)(\/|$)/;

/**
 * Locale routing first, then a cheap access check.
 *
 * This is not the gate. Middleware runs in the Edge Runtime, where Prisma
 * cannot load at all, so the only thing it can ask is whether a session cookie
 * is present — not whether it names a live session. A forged cookie gets past
 * this file and is then turned away by `(app)/layout.tsx`, which does have a
 * database and does check.
 *
 * What this buys is the redirect: without it a signed-out visitor renders the
 * whole shell and only then bounces, which is a wasted round trip and a flash
 * of someone else's furniture.
 *
 * Order matters. next-intl has to run first, because until it has resolved the
 * locale there is no prefix in the path to match `PUBLIC` against, and if it
 * wants to redirect (a bare `/`, or an unknown locale) that redirect wins.
 */
export default function middleware(request: NextRequest) {
  const response = handleI18n(request);

  // next-intl decided to redirect or rewrite the locale; let it, and check
  // access on the request that follows.
  if (response.headers.get('location')) return response;

  // Only a local dev run without a database browses freely. A deploy that is
  // missing DATABASE_URL keeps redirecting to /login: it is broken either way,
  // and broken-and-shut beats broken-and-open on a private site.
  if (guestModeAllowed()) return response;

  const { pathname } = request.nextUrl;
  // Strip the locale prefix: /ru/login -> /login
  const path = pathname.replace(/^\/(en|ru|uk|de)/, '') || '/';

  if (PUBLIC.test(path)) return response;
  if (request.cookies.has(SESSION_COOKIE)) return response;

  const locale = pathname.match(/^\/(en|ru|uk|de)/)?.[1] ?? routing.defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/login`;
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  // Run on every page, but never on API routes, static assets or files.
  matcher: ['/', '/(en|ru|uk|de)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
