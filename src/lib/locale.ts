import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { routing, type Locale } from '@/i18n/routing';

/**
 * Validate a `[locale]` segment, then opt the request into static rendering.
 *
 * Every page under `[locale]` must call this, not just the layout. A layout and
 * its page render *concurrently*, so a `notFound()` in the layout does not stop
 * the page from evaluating first — an unmatched path such as `/favicon.ico`
 * arrives as `locale = "favicon.ico"` and reaches any `Intl` call in the page
 * body, which throws `RangeError: Incorrect locale information provided` before
 * the layout's guard ever lands.
 *
 * Returning the narrowed type also removes the `as Locale` casts at call sites.
 */
export function resolveLocale(value: string): Locale {
  if (!routing.locales.includes(value as Locale)) notFound();
  setRequestLocale(value);
  return value as Locale;
}
