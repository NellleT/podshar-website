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
 * The push is done by animating this element's own width from zero, so it is a
 * real flex sibling of the canvas rather than a panel floating over one. Two
 * details make that read cleanly: `overflow-hidden` clips the contents while
 * the width animates, and the inner wrapper is pinned to the full open width so
 * the text inside never reflows mid-animation.
 *
 * Contents are stacked blocks — profile, stats, navigation — each divided by a
 * solid rule rather than a card of its own, so the panel stays one object.
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
      className={`shrink-0 overflow-hidden bg-canvas-sunk transition-[width] duration-drape ease-drape ${
        open ? 'w-sidebar border-r border-rule lg:w-sidebar-lg' : 'w-0'
      }`}
    >
      {/* Pinned to the open width so nothing reflows while the width animates. */}
      <div className="flex h-full w-sidebar flex-col lg:w-sidebar-lg">
        <header className="flex items-center justify-between border-b border-rule px-5 py-3">
          <PodsharWordmark className="text-[0.6rem] font-medium text-ink" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={tHome('closeMenu')}
            className="grid h-8 w-8 place-items-center border border-rule text-sm leading-none text-ink-muted transition-colors duration-drape hover:bg-sand hover:text-ink"
          >
            &#215;
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Profile */}
          <section className="border-b border-rule px-5 py-5">
            <p className="ps-label mb-4">{t('profile')}</p>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden border border-ink bg-sand text-sm font-medium text-ink">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base text-ink">{profile.displayName}</p>
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

          {/* Live quick-stats, as two blocks side by side */}
          <section className="border-b border-rule px-5 py-5">
            <p className="ps-label mb-4">{t('stats')}</p>
            <dl className="grid grid-cols-2 gap-2">
              <StatBlock label={t('dotaPts')} value={stats.dotaPts} />
              <StatBlock label={t('brawlCups')} value={stats.brawlCups} />
            </dl>
          </section>

          {/* Five destinations. The index lives behind the sun. */}
          <nav className="border-b border-rule px-5 py-5">
            <p className="ps-label mb-3">{t('navigation')}</p>
            <ul className="space-y-1">
              {PRIMARY_NAV.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between border px-3 py-2.5 text-sm transition-colors duration-drape ease-drape ${
                        isActive
                          ? 'border-ink bg-sand text-ink'
                          : 'border-transparent text-ink-muted hover:border-rule hover:bg-sand hover:text-ink'
                      }`}
                    >
                      <span>{tNav(item.labelKey)}</span>
                      <span aria-hidden="true" className="text-xs text-ink-faint">
                        &#8594;
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* The wireframe's down-arrow: everything the five links leave out. */}
            <Link
              href="/hub"
              className="mt-3 flex items-center justify-between border border-rule px-3 py-2.5 transition-colors duration-drape hover:bg-sand"
            >
              <span className="ps-label">{t('more')}</span>
              <span aria-hidden="true" className="text-xs text-ink-muted">
                &#8595;
              </span>
            </Link>
          </nav>
        </div>

        <footer className="flex items-center justify-between border-t border-rule px-5 py-3">
          <LocaleSwitcher />
          <button type="button" className="ps-label transition-colors hover:text-ink">
            {t('signOut')}
          </button>
        </footer>
      </div>
    </aside>
  );
}

function StatBlock({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="border border-rule bg-canvas p-3">
      <dt className="text-[0.6rem] uppercase tracking-label text-ink-muted">{label}</dt>
      <dd className="mt-2 text-xl font-light tabular-nums text-ink">
        {value === null ? (
          <span className="inline-block h-5 w-10 animate-pulse bg-sand align-middle" />
        ) : (
          value.toLocaleString()
        )}
      </dd>
    </div>
  );
}
