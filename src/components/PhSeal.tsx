'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

/** Twelve marks; the cardinals are drawn longer, as on an instrument dial. */
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

/**
 * The "ПХ" seal.
 *
 * Not a button — an object. Six concentric layers, built inward:
 *
 *   1. crop marks      registration corners, the way a lookbook plate is trimmed
 *   2. tick dial       twelve marks on a slow orbit, cardinals drawn longer
 *   3. rotated square  the archive geometry; its corners reach for the crop marks
 *   4. two rings       a wide hairline and a tight one, at different weights
 *   5. the disc        sand, with a pressed inner well for real depth
 *   6. the glyph       serif, widely tracked, the only filled type on the page
 *
 * Every inset is a percentage rather than a fixed step, so the whole assembly
 * keeps its proportions between the mobile and desktop sizes instead of the
 * layers drifting apart. On hover the piece opens outward — marks retreat, the
 * square twists, the disc inverts to clay — which reads as a mechanism
 * unlatching rather than a button lighting up.
 */
export function PhSeal() {
  const t = useTranslations('home');

  return (
    // `group` lives here, not on the link, so the caption below animates with
    // the object instead of being a sibling that never sees the hover.
    <div className="group flex flex-col items-center gap-7">
      <Link
        href="/hub"
        aria-label={t('enterCaption')}
        className="relative grid h-56 w-56 place-items-center rounded-full outline-offset-[12px] sm:h-72 sm:w-72"
      >
        {/* 1 — registration marks */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-5 w-5 border-l border-t border-clay/55 transition-transform duration-drape ease-drape group-hover:-translate-x-2 group-hover:-translate-y-2"
        />
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 h-5 w-5 border-r border-t border-clay/55 transition-transform duration-drape ease-drape group-hover:-translate-y-2 group-hover:translate-x-2"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-clay/55 transition-transform duration-drape ease-drape group-hover:-translate-x-2 group-hover:translate-y-2"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-clay/55 transition-transform duration-drape ease-drape group-hover:translate-x-2 group-hover:translate-y-2"
        />

        {/* 2 — the dial */}
        <span aria-hidden="true" className="absolute inset-[4%] animate-orbit">
          {TICKS.map((deg) => (
            <span
              key={deg}
              className="absolute inset-0"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <span
                className={`absolute left-1/2 top-0 w-px -translate-x-1/2 bg-clay ${
                  deg % 90 === 0 ? 'h-3 opacity-60' : 'h-1.5 opacity-35'
                }`}
              />
            </span>
          ))}
        </span>

        {/* 3 — archive geometry */}
        <span
          aria-hidden="true"
          className="absolute inset-[16%] rotate-45 border border-clay/25 transition-transform duration-[900ms] ease-drape group-hover:rotate-[63deg]"
        />

        {/* 4 — the rings */}
        <span
          aria-hidden="true"
          className="absolute inset-[17%] rounded-full border border-clay/45 transition-transform duration-drape ease-drape group-hover:scale-105"
        />
        <span
          aria-hidden="true"
          className="absolute inset-[21%] rounded-full border border-hairline transition-transform duration-drape ease-drape group-hover:scale-95"
        />

        {/* 5 — the disc */}
        <span
          aria-hidden="true"
          className="absolute inset-[25%] rounded-full bg-sand shadow-seal transition-[background-color,box-shadow] duration-drape ease-drape group-hover:bg-clay group-hover:shadow-seal-hover"
        />

        {/* 6 — the glyph */}
        <span className="relative font-display text-4xl tracking-[0.14em] text-ink transition-colors duration-drape ease-drape group-hover:text-canvas sm:text-5xl">
          {t('enter')}
        </span>
      </Link>

      <span className="ps-label transition-colors duration-300 group-hover:text-ink">
        {t('enterCaption')}
      </span>
    </div>
  );
}
