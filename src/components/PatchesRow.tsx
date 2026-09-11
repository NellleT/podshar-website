'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { CURRENT_VERSION } from '@/lib/patches';

/**
 * The version of the site, at the bottom of the drawer, with a dot when there
 * is something you have not read.
 *
 * It used to be a full-width block at the foot of the homepage. That put a
 * changelog in a bento of things happening *now*, where it was both the least
 * urgent thing on the page and the most visually expensive — and it was only
 * reachable from home, which is the one page you are least likely to be on
 * when you wonder what changed.
 *
 * Here it sits with the other facts about the site rather than about the day:
 * who you are, what language, which version, and the way out.
 */

/** The newest version this device has actually read. */
const SEEN_KEY = 'podshar:patches-seen';

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, CURRENT_VERSION);
  } catch {
    // Blocked site data. The dot stays; nothing else breaks.
  }
}

export function PatchesRow({ onOpen }: { onOpen?: () => void }) {
  const t = useTranslations('home');

  // No dot on the first frame, whatever this device remembers. The server
  // cannot know what you have read, so anything else is a hydration mismatch;
  // the dot arriving a moment later is the honest version of that.
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    try {
      setUnread(window.localStorage.getItem(SEEN_KEY) !== CURRENT_VERSION);
    } catch {
      // See above.
    }
  }, []);

  const body = (
    <>
      <span className="text-sm font-semibold tabular-nums text-ink">v{CURRENT_VERSION}</span>
      <span className="ps-label flex-1 text-left">{t('patchesLabel')}</span>
      {unread ? (
        <span className="flex items-center gap-2">
          {/* Announced rather than drawn twice: a screen reader gets the words,
              everyone else gets the dot. */}
          <span className="sr-only">{t('patchesNew')}</span>
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-reactor motion-safe:animate-breathe"
          />
        </span>
      ) : null}
    </>
  );

  const shared =
    'ps-rule flex w-full items-center gap-3 px-5 py-3 transition-colors duration-drape ease-drape hover:bg-sunk';

  // A panel when the shell can show one, a link to the page when it cannot.
  // The page is not a fallback for the sake of it: it is what a shared link
  // opens, what a reload lands on, and where the dog walks you when asked.
  if (!onOpen) {
    return (
      <Link href="/patches" className={shared} onClick={markSeen}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={shared}
      onClick={() => {
        markSeen();
        // The dot goes now rather than on the next mount: opening the list is
        // reading it, and a dot still burning behind the panel you are reading
        // is the site arguing with itself.
        setUnread(false);
        onOpen();
      }}
    >
      {body}
    </button>
  );
}

/**
 * Marks this device as having read the list, from the patches page itself —
 * the route the dog uses, and the one a shared link opens.
 */
export function PatchesSeen() {
  useEffect(markSeen, []);
  return null;
}
