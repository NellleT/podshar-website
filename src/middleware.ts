import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Run on every page, but never on API routes, static assets or files.
  matcher: ['/', '/(en|ru|uk|de)/:path*', '/((?!api|_next|_vercel|.*\..*).*)']
};
