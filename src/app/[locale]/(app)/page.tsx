import { getTranslations } from 'next-intl/server';

import { Greeting } from '@/components/Greeting';
import { MemberAvatar } from '@/components/profile/MemberAvatar';
import { LocalClock } from '@/components/LocalClock';
import { PHButton } from '@/components/PHButton';
import { PatchesCard } from '@/components/Patches';
import { QuoteCookie } from '@/components/QuoteCookie';
import { getCurrentMember } from '@/lib/session';
import { sharedDayIndex } from '@/lib/day';
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

  // One quote a day and one greeting a day, the same ones for all three of us,
  // rolling over at Zurich midnight. Both are seeded from the day rather than
  // drawn at random — `lib/day.ts` explains why that is not a stylistic choice.
  const day = sharedDayIndex(now);
  const quote = tQuote(String(day % QUOTE_COUNT));

  return (
    <div className="grid grid-cols-1 content-start gap-3 p-3 sm:gap-4 sm:p-4 md:grid-cols-6">
      {/* Greeting — full width, the only large type on the page */}
      <section className="block-card animate-rise-in flex flex-col justify-center gap-2 px-6 py-10 sm:px-10 sm:py-12 md:col-span-6">
        <p className="ps-label">{t('greetingLabel')}</p>
        <Greeting name={member.displayName.split(' ')[0]} day={day} />
      </section>

      {/* The reactor — the dominant block */}
      <section className="block-card animate-rise-in flex items-center justify-center bg-sunk px-4 py-10 [animation-delay:60ms] md:col-span-4 md:row-span-2">
        <PHButton />
      </section>

      {/* The date, and your own clock beside it.

          The two are not the same kind of fact. The date is shared — it is
          rendered on the server in Zurich time so all three of us see the same
          day. The clock is yours, resolved in your browser, in your zone. */}
      <section className="block-card animate-rise-in flex flex-col gap-4 p-6 [animation-delay:120ms] md:col-span-2">
        <p className="ps-label">{t('today')}</p>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div>
            <p className="text-3xl font-semibold leading-tight text-ink">
              {fmt({ day: '2-digit', month: 'long' })}
            </p>
            <p className="mt-1 text-base font-medium capitalize text-ink-muted">
              {fmt({ weekday: 'long' })} &middot; {fmt({ year: 'numeric' })}
            </p>
          </div>
          <LocalClock />
        </div>
      </section>

      {/* Identity */}
      <section className="block-card animate-rise-in flex flex-col gap-4 p-6 [animation-delay:180ms] md:col-span-2">
        <p className="ps-label">{t('memberLabel')}</p>
        <div className="flex items-center gap-3">
          <MemberAvatar
            preset={member.avatarPreset}
            displayName={member.displayName}
            className="h-11 w-11"
          />
          <div className="min-w-0">
            <p className="truncate text-2xl font-semibold leading-tight text-ink">
              {member.displayName}
            </p>
            <p className="truncate text-base text-ink-muted">@{member.handle}</p>
          </div>
        </div>
      </section>

      {/* Quote of the day. The one place on the page allowed to have a voice,
          and the only block you have to open before it will speak. */}
      <QuoteCookie
        label={t('quoteLabel')}
        quote={quote}
        hint={t('quoteHint')}
        reveal={t('quoteReveal')}
        day={day}
      />

      {/* Что менялось на сайте — одной строкой и ссылкой. Внизу намеренно: это
          единственный блок, который читают не каждый день, и место под цитатой
          — ровно та высота, до которой доходят, посмотрев всё остальное. */}
      <PatchesCard />
    </div>
  );
}
