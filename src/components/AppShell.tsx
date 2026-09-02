'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { LeftSidebar } from './LeftSidebar';
import { RightAIChat } from './RightAIChat';
import type { MemberProfile, QuickStats } from '@/lib/types';

/**
 * The three-column shell.
 *
 * The left panel *pushes* rather than overlays, which is the whole reason this
 * is a flex row and not a fixed panel over a dimmed page. The two breakpoints
 * behave differently on purpose:
 *
 *   below lg — `min-w-full` keeps the canvas a full viewport wide, so opening
 *              the panel slides the canvas off to the right (a real drawer
 *              push) instead of crushing it into 130px of unusable column.
 *   lg and up — `lg:min-w-0` lets the canvas give up width instead, so the
 *              greeting and the seal re-centre in the space that is left.
 *
 * `overflow-x-clip` hides the mobile overhang. It is `clip` rather than
 * `hidden` deliberately: `overflow-x: hidden` forces the computed `overflow-y`
 * to `auto`, which would quietly turn this row into a second scroll container.
 */
export function AppShell({
  profile,
  stats,
  children
}: {
  profile: MemberProfile;
  stats: QuickStats;
  children: React.ReactNode;
}) {
  const t = useTranslations('home');
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  // A tap-through should not leave the drawer standing open behind the page.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  return (
    <div className="flex min-h-dvh overflow-x-clip bg-canvas">
      <LeftSidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        profile={profile}
        stats={stats}
      />

      <div className="relative flex min-w-full flex-1 flex-col lg:min-w-0">
        {/* The trigger sits inside the canvas, so the push carries it along. */}
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label={t('openMenu')}
          aria-expanded={navOpen}
          aria-controls="podshar-nav"
          className="group absolute left-5 top-5 z-20 flex h-11 w-11 flex-col items-start justify-center gap-[6px] sm:left-8 sm:top-8"
        >
          {/* Three hairlines, the middle one short. Catalogue, not hamburger. */}
          <span className="h-px w-7 bg-ink transition-all duration-drape ease-drape group-hover:w-9 group-hover:bg-clay" />
          <span className="h-px w-4 bg-ink transition-all duration-drape ease-drape group-hover:w-9 group-hover:bg-clay" />
          <span className="h-px w-7 bg-ink transition-all duration-drape ease-drape group-hover:w-9 group-hover:bg-clay" />
        </button>

        <main className="flex flex-1 flex-col">{children}</main>
      </div>

      <RightAIChat />
    </div>
  );
}
