'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

import { SpoilerDust } from './SpoilerDust';

/**
 * The quote of the day, sealed until you break it open.
 *
 * A fortune cookie, borrowing the mechanic from a chat spoiler: the whole block
 * arrives blurred, and one tap dissolves it. The point is the half second
 * before you read it — a quote you have already seen at the top of the page is
 * just a line of text, and this is the one block on the homepage allowed to
 * have a voice.
 *
 * Broken once a day, not once a visit. The quote itself rolls over at Zurich
 * midnight for all three of them (see `lib/day.ts`), so the seal follows the
 * same clock: open it in the morning and it stays open until a new one
 * arrives. Re-sealing it on every reload would turn a small pleasure into a
 * click you have to perform before you are allowed to read your own homepage.
 *
 * Kept per device rather than in the database. Whether you have read today's
 * quote is not a fact the other two need, and it is not worth a column, a
 * write on every page view, or a round trip before the page can render.
 */

/** Which day's cookie has been opened on this device. */
const STORAGE_KEY = 'podshar:quote-opened';

export function QuoteCookie({
  label,
  quote,
  hint,
  reveal,
  day
}: {
  label: string;
  quote: string;
  /** The nudge over the seal, since a blurred block does not look pressable. */
  hint: string;
  /** What the seal announces itself as, for a screen reader. */
  reveal: string;
  day: number;
}) {
  const reduceMotion = useReducedMotion();

  // Always sealed on the server and on the first client frame, whatever this
  // device remembers. Reading `localStorage` during render would make the two
  // disagree, which is a hydration mismatch on every load for the one person
  // who already read today's quote.
  const [opened, setOpened] = useState(false);

  // Restoring is not the same event as opening. Without this the block would
  // play its whole dissolve every time you came back to the homepage, which
  // reads as the site forgetting and then remembering.
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === String(day)) {
        setRestored(true);
        setOpened(true);
      }
    } catch {
      // Private windows and blocked site data throw on access rather than
      // returning null. A cookie that re-seals is a small loss; a homepage
      // that throws is not.
    }
  }, [day]);

  const breakOpen = () => {
    setOpened(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(day));
    } catch {
      // Same as above. It stays open for this page view either way.
    }
  };

  const still = restored || reduceMotion;

  return (
    <section className="block-card animate-rise-in relative overflow-hidden [animation-delay:240ms] md:col-span-6">
      {/* Everything inside blurs together — label, quote and sticker — so the
          block reads as one sealed object rather than a card with its contents
          smudged.

          The slight scale while sealed is doing real work: a blur fades out at
          the edges of its own box, so an unscaled wrapper shows a pale rim
          where the card's background leaks through. Growing it a few percent
          pushes those soft edges past the clip, and shrinking back to 1 on
          opening gives the block a settle that a pure blur does not have. */}
      <div
        aria-hidden={!opened}
        className={`flex flex-col gap-3 px-6 py-8 transition-[filter,transform] ease-drape sm:px-10 ${
          still ? 'duration-0' : 'duration-[720ms]'
        } ${opened ? 'blur-0 scale-100' : 'scale-[1.04] select-none blur-[10px]'}`}
      >
        <p className="ps-label">{label}</p>
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
      </div>

      {/* The seal. A real button covering the block, present only while it is
          closed — so once opened the quote is ordinary text you can select,
          rather than a paragraph living inside a control.

          `aria-hidden` on the content above and a label here is deliberate: a
          blurred block means nothing to a screen reader, so the honest
          equivalent is a button that says what it will reveal. Reading the
          quote aloud before it is opened would spoil for one person the thing
          the block exists to do for everyone else. */}
      {opened ? null : (
        <button
          type="button"
          onClick={breakOpen}
          aria-label={reveal}
          className="group absolute inset-0 grid place-items-center"
        >
          {/* Dust over the blur. A blur on its own reads as a page that failed
              to render; something scattered over it reads as covered up. It
              also gives the block the only thing on this page that answers the
              cursor without being pressed. */}
          <SpoilerDust active={!opened} />
          {/* The site's own label, not a button glued on top. A bordered pill
              with a shadow exists nowhere else here — the reactor's own hint is
              exactly this: small, lowercase, muted, floating over the thing it
              describes. Focus is left to the global outline rather than a ring
              of its own, for the same reason. */}
          <span className="ps-label relative opacity-80 transition-opacity duration-drape ease-drape group-hover:opacity-100">
            {hint}
          </span>
        </button>
      )}
    </section>
  );
}
