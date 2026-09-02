import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Greeting } from '@/components/Greeting';
import { PhSeal } from '@/components/PhSeal';
import { PodsharWordmark } from '@/components/PodsharMark';
import { getCurrentMember } from '@/lib/session';

/**
 * The homepage is a cover, not a dashboard.
 *
 * Two elements carry it: the greeting and the seal. The drawer and the
 * assistant column live in the shell, so this file stays a single centred
 * column of type. Widgets (weather, Doomsday, quote of the day) belong behind
 * the seal, on the hub, rather than crowding the cover.
 *
 * The left padding steps up at `sm` to clear the drawer trigger the shell
 * pins to the top-left of this canvas.
 */
export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, member] = await Promise.all([
    getTranslations('home'),
    getCurrentMember()
  ]);

  const issue = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Zurich'
  }).format(new Date());

  return (
    <div className="flex min-h-dvh flex-col px-5 py-5 sm:px-8 sm:py-8">
      {/* The trigger occupies the top-left, so the issue line takes the right. */}
      <header className="flex items-start justify-end pb-6">
        <div className="text-right">
          <p className="ps-label">{t('issue')}</p>
          <p className="mt-1 font-display text-sm text-ink">{issue}</p>
        </div>
      </header>

      <div className="border-t border-hairline" />

      <div className="flex flex-1 flex-col items-center justify-center gap-14 py-16 text-center sm:gap-20">
        <div className="animate-rise-in max-w-3xl px-2">
          <Greeting name={member.displayName.split(' ')[0]} />
        </div>

        <div className="animate-rise-in [animation-delay:180ms]">
          <PhSeal />
        </div>
      </div>

      <div className="border-t border-hairline" />

      <footer className="flex items-end justify-between pt-6">
        <PodsharWordmark className="text-xs text-ink-muted" />
        {/* Reserved so the mobile assistant launcher has clean air around it. */}
        <span aria-hidden="true" className="h-14 w-14 lg:hidden" />
      </footer>
    </div>
  );
}
