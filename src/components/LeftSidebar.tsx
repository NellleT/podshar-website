'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { PRIMARY_NAV_SLOTS } from '@/lib/navigation';
import { PodsharWordmark } from './PodsharMark';
import { LocaleSwitcher } from './LocaleSwitcher';
import { SignOutButton } from './auth/SignOutButton';
import type { MemberProfile, QuickStats } from '@/lib/types';

/**
 * The drawer. Closed on first paint, and it pushes the canvas when it opens.
 *
 * The push is done by animating this element's own width from zero, so it is a
 * real flex sibling of the canvas rather than a panel floating over one. Two
 * details make that read cleanly: `overflow-hidden` clips the contents while
 * the width animates, and the inner wrapper is pinned to the full open width so
 * the text inside never reflows mid-animation.
 *
 * It scrolls on its own. `sticky top-0` with `h-dvh` pins the drawer to the
 * viewport while the canvas scrolls past it, and the region between the header
 * and the footer takes its own `overflow-y-auto` — so a long nav list scrolls
 * inside the drawer instead of dragging the drawer up the page with the
 * greeting and the reactor. Sticky, not fixed, deliberately: a fixed panel
 * leaves the flow, and leaving the flow is exactly what would break the push.
 *
 * Order, top to bottom: who you are, then how you are doing, then where you can
 * go. The profile and the stats sit together as one unit at the top — they are
 * both answers to "me" — and navigation is pushed down past a deliberate gap.
 * That gap is doing real work: without it the drawer reads as one undifferentiated
 * list, and the eye has to parse the labels to find the links.
 */
export function LeftSidebar({
  open,
  onClose,
  profile,
  stats
}: {
  open: boolean;
  onClose: () => void;
  profile: MemberProfile;
  stats: QuickStats;
}) {
  const t = useTranslations('sidebar');
  const tHome = useTranslations('home');
  const tNav = useTranslations('nav');
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const initials = profile.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      id="podshar-nav"
      aria-label={t('navigation')}
      // Collapsed content stays in the DOM, so without `inert` a keyboard user
      // tabs into rows that are clipped to zero width.
      inert={!open}
      className={`sticky top-0 h-dvh shrink-0 self-start overflow-hidden bg-surface transition-[width] duration-drape ease-drape ${
        open ? 'w-sidebar border-r-2 border-rule lg:w-sidebar-lg' : 'w-0'
      }`}
    >
      {/* Pinned to the open width so nothing reflows while the width animates. */}
      <div className="flex h-full w-sidebar flex-col lg:w-sidebar-lg">
        <header className="flex items-center justify-between border-b border-rule-soft px-5 py-4">
          <PodsharWordmark className="text-xs font-semibold text-ink" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={tHome('closeMenu')}
            className="grid h-9 w-9 place-items-center rounded border-2 border-rule text-base leading-none text-ink-muted transition-colors duration-drape hover:bg-sunk hover:text-ink"
          >
            &#215;
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Who you are, and how you are doing. One block, no rule between
              them — the stats belong to the profile, not beside it. */}
          <section className="px-5 pb-6 pt-6">
            <p className="ps-label mb-4">{t('profile')}</p>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-rule bg-sunk text-base font-semibold text-ink">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold leading-tight text-ink">
                  {profile.displayName}
                </p>
                <p className="truncate text-sm text-ink-muted">@{profile.handle}</p>
              </div>
              {/* Editing lands in Phase 2. The affordance is reserved now. */}
              <button
                type="button"
                disabled
                className="ps-label cursor-not-allowed text-ink-faint"
              >
                {t('editProfile')}
              </button>
            </div>

            <p className="ps-label mb-3 mt-7">{t('stats')}</p>
            <dl className="grid grid-cols-2 gap-2">
              <StatBlock label={t('dotaPts')} value={stats.dotaPts} />
              <StatBlock label={t('brawlCups')} value={stats.brawlCups} />
            </dl>
          </section>

          {/* Five reserved rows. Names and destinations are not decided yet, so
              they say so rather than pretending to be links — see
              PRIMARY_NAV_SLOTS in src/lib/navigation.ts. */}
          <nav className="border-t border-rule-soft px-5 pb-6 pt-8">
            <p className="ps-label mb-4">{t('navHeading')}</p>
            <ul className="space-y-2">
              {Array.from({ length: PRIMARY_NAV_SLOTS }, (_, i) => (
                <li key={i}>
                  <span className="flex cursor-not-allowed items-center justify-between rounded border-2 border-dashed border-rule-soft px-3 py-3 text-base text-ink-faint">
                    {tNav('wip')}
                    <span aria-hidden="true" className="text-sm">
                      &#8943;
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <footer className="flex items-center justify-between border-t border-rule-soft px-5 py-3">
          <LocaleSwitcher />
          <SignOutButton />
        </footer>
      </div>
    </aside>
  );
}

function StatBlock({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded border-2 border-rule bg-canvas p-3">
      <dt className="text-[0.7rem] lowercase leading-tight tracking-label text-ink-muted">
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-semibold tabular-nums text-ink">
        {value === null ? (
          <span className="inline-block h-6 w-12 animate-pulse rounded-sm bg-sunk align-middle" />
        ) : (
          value.toLocaleString()
        )}
      </dd>
    </div>
  );
}
