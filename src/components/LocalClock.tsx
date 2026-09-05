'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

/**
 * The viewer's own clock.
 *
 * The date beside it is rendered on the server in Zurich time, because the date
 * is a shared fact — all three of us should agree on what day it is. The time is
 * the opposite: it is whatever the clock on *your* wall says, which the server
 * cannot know. So this resolves after mount, from the browser.
 *
 * Nothing is rendered until it does. An empty first paint is deliberate: any
 * placeholder time would be a different string on the server than in the
 * browser, and that is a hydration mismatch on every single load. The wrapper
 * reserves the height so the block does not jump when the value lands.
 *
 * Ticking every second rather than every minute costs one `setState` a second
 * against a component with three text nodes, and it is the difference between a
 * clock and a screenshot of one.
 */
export function LocalClock() {
  const locale = useLocale();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now
    ? new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now)
    : null;

  const seconds = now
    ? new Intl.DateTimeFormat(locale, { second: '2-digit' }).format(now).padStart(2, '0')
    : null;

  // "Europe/Zurich" -> "Zurich". The region is noise; the city is the answer.
  const zone = now
    ? (Intl.DateTimeFormat().resolvedOptions().timeZone ?? '').split('/').pop()?.replace(/_/g, ' ')
    : null;

  return (
    <div className="min-h-[3.25rem]" aria-live="off">
      {time ? (
        <>
          <p className="flex items-baseline gap-1 text-3xl font-semibold leading-tight tabular-nums text-ink">
            {time}
            <span className="text-base font-medium text-ink-faint">{seconds}</span>
          </p>
          {zone ? <p className="mt-1 text-sm text-ink-muted">{zone}</p> : null}
        </>
      ) : null}
    </div>
  );
}
