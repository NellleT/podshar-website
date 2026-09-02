'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type Slot = 'night' | 'morning' | 'afternoon' | 'evening';

function slotFor(date: Date): Slot {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 23) return 'evening';
  return 'night';
}

/**
 * Time-of-day greeting.
 *
 * The slot depends on the *viewer's* clock, which the server cannot know, so
 * it resolves after mount. To keep the layout from jumping we render the
 * longest-lived string invisibly during SSR: same markup on both sides, no
 * hydration mismatch, no reflow when the real value lands.
 */
export function Greeting({ name }: { name?: string }) {
  const t = useTranslations('greeting');
  const [slot, setSlot] = useState<Slot | null>(null);

  useEffect(() => {
    const sync = () => setSlot(slotFor(new Date()));
    sync();
    // Re-check every minute so an open tab rolls over at the boundary.
    const id = setInterval(sync, 60_000);
    return () => clearInterval(id);
  }, []);

  const text = t(slot ?? 'afternoon');

  return (
    <h1
      className={`text-greeting font-display font-normal text-ink transition-opacity duration-700 ${
        slot ? 'opacity-100' : 'opacity-0'
      }`}
      aria-live="polite"
    >
      {text}
      {name ? <span className="text-clay">, {name}</span> : null}
      <span className="text-clay">…</span>
    </h1>
  );
}
