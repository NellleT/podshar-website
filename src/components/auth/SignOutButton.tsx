'use client';

import { useLocale, useTranslations } from 'next-intl';

import { logout } from '@/lib/auth/actions';

/**
 * Sign out, as a form rather than an onClick.
 *
 * Signing out changes server state, so it has to be a POST — a link or a click
 * handler firing a GET can be triggered by anything that renders a URL, from a
 * prefetcher to an image tag in a chat preview.
 *
 * `logout.bind(null, locale)` is how a server action takes an argument the
 * client knows and the server does not: actions receive no route params, and
 * the redirect afterwards has to land on the language being read.
 */
export function SignOutButton() {
  const locale = useLocale();
  const t = useTranslations('sidebar');

  return (
    <form action={logout.bind(null, locale)}>
      <button type="submit" className="ps-label transition-colors hover:text-ink">
        {t('signOut')}
      </button>
    </form>
  );
}
