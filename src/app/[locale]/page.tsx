import { getTranslations } from 'next-intl/server';

import { Greeting } from '@/components/Greeting';
import { PHButton } from '@/components/PHButton';
import { getCurrentMember } from '@/lib/session';
import { resolveLocale } from '@/lib/locale';

/**
 * The homepage as a bento grid.
 *
 * Six columns. The greeting spans all of them; the sun takes a wide block that
 * is two rows tall, and the two meta blocks stack beside it to match its
 * height. Deliberately varied block sizes — an even three-across row of equal
 * thirds reads as a table, not a bento.
 *
 * Row heights are `auto`, never `1fr`: letting a row absorb the viewport leaves
 * the small blocks cavernous, with a label stranded at the top and a value at
 * the bottom. The sun sets the height and everything else agrees with it.
 */
export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);

  const [t, member] = await Promise.all([
    getTranslations('home'),
    getCurrentMember()
  ]);

  const now = new Date();
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'Europe/Zurich' }).format(now);

  return (
    <div className="grid grid-cols-1 content-start gap-3 p-3 sm:gap-4 sm:p-4 md:grid-cols-6">
      {/* Greeting — full width, the only large type on the page */}
      <section className="block-card animate-rise-in flex flex-col justify-center gap-2 px-6 py-10 sm:px-10 sm:py-12 md:col-span-6">
        <p className="ps-label">{t('greetingLabel')}</p>
        <Greeting name={member.displayName.split(' ')[0]} />
      </section>

      {/* The sun — the dominant block */}
      <section className="block-card animate-rise-in flex items-center justify-center bg-sunk px-4 py-10 [animation-delay:60ms] md:col-span-4 md:row-span-2">
        <PHButton />
      </section>

      {/* Issue */}
      <section className="block-card animate-rise-in flex flex-col gap-4 p-6 [animation-delay:120ms] md:col-span-2">
        <p className="ps-label">{t('today')}</p>
        <div>
          <p className="text-3xl font-semibold leading-tight text-ink">
            {fmt({ day: '2-digit', month: 'long' })}
          </p>
          <p className="mt-1 text-base font-medium capitalize text-ink-muted">
            {fmt({ weekday: 'long' })} &middot; {fmt({ year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Identity */}
      <section className="block-card animate-rise-in flex flex-col gap-4 p-6 [animation-delay:180ms] md:col-span-2">
        <p className="ps-label">{t('memberLabel')}</p>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-rule bg-sunk text-base font-semibold text-ink"
          >
            {member.displayName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-2xl font-semibold leading-tight text-ink">
              {member.displayName}
            </p>
            <p className="truncate text-base text-ink-muted">@{member.handle}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
