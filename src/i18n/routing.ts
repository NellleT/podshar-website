import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ru', 'uk', 'de'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true
});

export type Locale = (typeof routing.locales)[number];

/** Locale-aware replacements for next/link and next/navigation. Always import
 *  Link from here, never from next/link, or the locale prefix gets dropped. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  ru: 'RU',
  uk: 'UK',
  de: 'DE'
};
