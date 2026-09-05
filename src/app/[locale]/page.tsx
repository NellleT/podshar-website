import { getTranslations } from 'next-intl/server';

import { Greeting } from '@/components/Greeting';
import { PHButton } from '@/components/PHButton';
import { getCurrentMember } from '@/lib/session';
import { resolveLocale } from '@/lib/locale';

/** How many quotes each catalogue carries. Keep in step with `quotes` in the JSON. */
const QUOTE_COUNT = 8;

/**
 * The homepage as a bento grid.
 *
 * Six columns. The greeting spans all of them; the reactor takes a wide block
 * that is two rows tall, and the two meta blocks stack beside it to match its
 * height. The quote runs full width underneath. Deliberately varied block sizes
 * — an even three-across row of equal thirds reads as a table, not a bento.
 *
 * Row heights are `auto`, never `1fr`: letting a row absorb the viewport leaves
 * the small blocks cavernous, with a label stranded at the top and a value at
 * the bottom. The reactor sets the height and everything else agrees with it.
 */
export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);

  const [t, tQuote, member] = await Promise.all([
    getTranslations('home'),
    getTranslations('quotes'),
    getCurrentMember()
  ]);

  const now = new Date();
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'Europe/Zurich' }).format(now);

  // One quote a day, the same one for all three of us, rolling over at Zurich
  // midnight. Derived from the date rather than drawn at random on purpose:
  // `Math.random()` here would pick a different line on the server than on the
  // client and blow up hydration, and it would also change under you on every
  // refresh, which kills the "quote of the *day*" joke.
  const zurichDay = Math.floor(
    Date.parse(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Zurich',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(now)
    ) / 86_400_000
  );
  const quote = tQuote(String(zurichDay % QUOTE_COUNT));

  return (
    <div className="grid grid-cols-1 content-start gap-3 p-3 sm:gap-4 sm:p-4 md:grid-cols-6">
      {/* Greeting — full width, the only large type on the page */}
      <section className="block-card animate-rise-in flex flex-col justify-center gap-2 px-6 py-10 sm:px-10 sm:py-12 md:col-span-6">
        <p className="ps-label">{t('greetingLabel')}</p>
        <Greeting name={member.displayName.split(' ')[0]} />
      </section>

      {/* The reactor — the dominant block */}
      <section className="block-card animate-rise-in flex items-center justify-center bg-sunk px-4 py-10 [animation-delay:60ms] md:col-span-4 md:row-span-2">
        <PHButton />
      </section>

      {/* The date */}
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

      {/* Quote of the day. The one place on the page allowed to have a voice. */}
      <section className="block-card animate-rise-in relative flex flex-col gap-3 px-6 py-8 [animation-delay:240ms] sm:px-10 md:col-span-6">
        <p className="ps-label">{t('quoteLabel')}</p>
        <p className="max-w-3xl text-xl font-medium leading-snug text-ink sm:text-2xl">
          {quote}
        </p>
        {/* A sticker, stuck on slightly crooked, because a straight one would
            just be another label. */}
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 -rotate-6 rounded-sm border-2 border-ink bg-reactor px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-white sm:right-6"
        >
          ПХ™
        </span>
      </section>
    </div>
  );
}
