'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { PRIMARY_NAV } from '@/lib/navigation';
import { PodsharWordmark } from './PodsharMark';
import { LocaleSwitcher } from './LocaleSwitcher';
import type { MemberProfile, QuickStats } from '@/lib/types';

/**
 * The drawer. Closed on first paint, and it pushes the canvas when it opens.
 *
 * The push is done by animating this element's own width from 0, so it is a
 * real flex sibling of the canvas rather than a panel floating over one. Two
 * details make that read smoothly:
 *
 *   `overflow-hidden` on the outer element clips the contents while the width
 *   animates, and the inner wrapper is pinned to the full open width so the
 *   text inside never reflows mid-animation. Reflowing type during a transition
 *   is the tell that separates a cheap drawer from an expensive one.
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
  const pathname = usePathname();
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
      // tabs into links that are clipped to zero width.
      inert={!open}
      className={`shrink-0 overflow-hidden border-ink/10 bg-canvas-sunk transition-[width] duration-drape ease-drape ${
        open ? 'w-sidebar border-r lg:w-sidebar-lg' : 'w-0 border-r-0'
      }`}
    >
      {/* Pinned to the open width so nothing reflows while the width animates. */}
      <div className="flex h-full w-sidebar flex-col lg:w-sidebar-lg">
        <header className="flex items-center justify-between px-6 pb-5 pt-6">
          <PodsharWordmark className="text-xs text-ink" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={tHome('closeMenu')}
            className="text-xl leading-none text-ink-muted transition-colors hover:text-ink"
          >
            &#215;
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Profile */}
          <section className="border-t border-hairline px-6 py-5">
            <p className="ps-label mb-4">{t('profile')}</p>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-sand font-display text-sm text-ink">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base text-ink">
                  {profile.displayName}
                </p>
                <p className="truncate text-xs text-ink-muted">@{profile.handle}</p>
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
          </section>

          {/* Live quick-stats */}
          <section className="border-t border-hairline px-6 py-5">
            <p className="ps-label mb-4">{t('stats')}</p>
            <dl className="space-y-3">
              <StatRow label={t('dotaPts')} value={stats.dotaPts} />
              <StatRow label={t('brawlCups')} value={stats.brawlCups} />
            </dl>
          </section>

          {/* Five destinations. The index lives behind the seal. */}
          <nav className="border-t border-hairline px-6 py-5">
            <p className="ps-label mb-3">{t('navigation')}</p>
            <ul>
              {PRIMARY_NAV.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group -mx-3 flex items-center justify-between rounded-sm px-3 py-2.5 font-display text-base transition-colors duration-300 ease-drape hover:bg-sand ${
                        isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      <span>{tNav(item.labelKey)}</span>
                      <span
                        aria-hidden="true"
                        className={`h-px bg-clay transition-all duration-drape ease-drape ${
                          isActive ? 'w-5' : 'w-0 group-hover:w-5'
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* The wireframe's down-arrow: everything the five links leave out. */}
            <Link
              href="/hub"
              className="group -mx-3 mt-2 flex items-center justify-between rounded-sm border-t border-hairline px-3 pb-1 pt-3 text-ink-muted transition-colors duration-300 hover:text-ink"
            >
              <span className="ps-label">{t('more')}</span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-drape ease-drape group-hover:translate-y-0.5"
              >
                <path
                  d="M8 3v9M4.5 8.5 8 12l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </nav>
        </div>

        <footer className="flex items-center justify-between border-t border-hairline px-6 py-4">
          <LocaleSwitcher />
          <button type="button" className="ps-label transition-colors hover:text-ink">
            {t('signOut')}
          </button>
        </footer>
      </div>
    </aside>
  );
}

function StatRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-display text-xl tabular-nums text-ink">
        {value === null ? (
          <span className="inline-block h-4 w-12 animate-pulse rounded-sm bg-sand align-middle" />
        ) : (
          value.toLocaleString()
        )}
      </dd>
    </div>
  );
}
