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
 * who you are, what language, which version, and the way out. That is where
 * people already look for it.
 */

/** The newest version this device has actually read. */
const SEEN_KEY = 'podshar:patches-seen';

export function PatchesRow() {
  const t = useTranslations('home');

  // No dot on the first frame, whatever this device remembers. The server
  // cannot know what you have read, so anything else is a hydration mismatch;
  // the dot arriving a moment later is the honest version of that.
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    try {
      setUnread(window.localStorage.getItem(SEEN_KEY) !== CURRENT_VERSION);
    } catch {
      // Blocked site data throws rather than returning null. No dot is a
      // better failure than a drawer that does not render.
    }
  }, []);

  return (
    <Link
      href="/patches"
      className="ps-rule flex items-center gap-3 px-5 py-3 transition-colors duration-drape ease-drape hover:bg-sunk"
    >
      <span className="text-sm font-semibold tabular-nums text-ink">v{CURRENT_VERSION}</span>
      <span className="ps-label flex-1">{t('patchesLabel')}</span>
      {unread ? (
        <span
          // Announced rather than drawn twice: a screen reader gets the words,
          // everyone else gets the dot.
          className="flex items-center gap-2"
        >
          <span className="sr-only">{t('patchesNew')}</span>
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-reactor motion-safe:animate-breathe"
          />
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Marks this device as having read the list. Rendered by the patches page
 * itself, because opening the page is what "read" means — marking it on the
 * click would clear the dot for someone who changed their mind on the way.
 */
export function PatchesSeen() {
  useEffect(() => {
    try {
      window.localStorage.setItem(SEEN_KEY, CURRENT_VERSION);
    } catch {
      // Then the dot stays. Harmless, and better than a page that throws.
    }
  }, []);

  return null;
}
