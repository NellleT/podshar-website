'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { routing, usePathname, useRouter, LOCALE_LABELS, type Locale } from '@/i18n/routing';

/** Four-up locale strip. Swaps the prefix on the current path, keeping the
 *  reader where they are instead of bouncing them home. */
export function LocaleSwitcher() {
  const t = useTranslations('home');
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('language')}>
      {routing.locales.map((locale) => {
        const isActive = locale === active;
        return (
          <button
            key={locale}
            type="button"
            disabled={pending}
            aria-current={isActive ? 'true' : undefined}
            onClick={() =>
              startTransition(() => router.replace(pathname, { locale }))
            }
            className={`px-2 py-1 text-label uppercase transition-colors duration-300 ${
              isActive ? 'text-ink' : 'text-ink-faint hover:text-clay'
            }`}
          >
            {LOCALE_LABELS[locale]}
          </button>
        );
      })}
    </div>
  );
}
