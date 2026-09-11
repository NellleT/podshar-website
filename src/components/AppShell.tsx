'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LeftSidebar } from './LeftSidebar';
import { Modal } from './Modal';
import { RightAIChat } from './RightAIChat';
import { PodsharWordmark } from './PodsharMark';
import type { MemberProfile, QuickStats } from '@/lib/types';

/**
 * The shell: a drawer and a canvas.
 *
 * Two columns, not three — the assistant left the flow in v0.5 and is now a
 * fixed panel over the canvas, so nothing here reserves width for it.
 *
 * The left panel *pushes* rather than overlays, which is why this is a flex row
 * and not a fixed panel over a dimmed page. The two breakpoints differ on
 * purpose:
 *
 *   below lg — `min-w-full` keeps the canvas a full viewport wide, so opening
 *              the panel slides the canvas off to the right (a real drawer
 *              push) instead of crushing it into an unusable column.
 *   lg and up — `lg:min-w-0` lets the canvas give up width instead, so the
 *              bento grid re-flows into the space that is left.
 *
 * `overflow-x-clip` hides the mobile overhang. It is `clip` rather than
 * `hidden` deliberately: `overflow-x: hidden` forces the computed `overflow-y`
 * to `auto`, which would quietly turn this row into a second scroll container.
 */
export function AppShell({
  profile,
  stats,
  children,
  patches
}: {
  profile: MemberProfile;
  stats: QuickStats;
  children: React.ReactNode;
  /**
   * The patch list, rendered on the server upstairs and shown here in a panel.
   * It arrives as a prop rather than being fetched on demand because turning
   * handles into names needs the database, and a dialog that opens on a
   * spinner is not the quick glance this is meant to be.
   */
  patches?: React.ReactNode;
}) {
  const t = useTranslations('home');
  const tPatches = useTranslations('patches');
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  /**
   * The patch list, as a panel over whatever you were reading.
   *
   * This was briefly a Next intercepting route, which is the textbook way to
   * give a panel its own address. It broke the client router outright —
   * `initialTree is not iterable` on every navigation — somewhere in the
   * crossing of a dynamic `[locale]`, a route group and next-intl's navigation.
   * A dialog in state does the same job for the reader, and `/patches` is still
   * a real page for a link sent to somebody else, for a reload, and for the dog
   * to walk you to.
   */
  const [patchesOpen, setPatchesOpen] = useState(false);

  // Everything except the homepage is one level down, so "back" and "home" are
  // the same journey. That is why this is a link to `/` and not `router.back()`:
  // history knows where you came *from*, which on a first visit is another site
  // entirely, and an arrow that sometimes leaves Podshar is worse than no arrow.
  const isHome = pathname === '/';

  // A tap-through should not leave the drawer standing open behind the page.
  useEffect(() => {
    setNavOpen(false);
    setPatchesOpen(false);
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
        profile={profile}
        stats={stats}
        onOpenPatches={patches ? () => setPatchesOpen(true) : undefined}
      />

      <div className="flex min-w-full flex-1 flex-col lg:min-w-0">
        {/* Top bar. The trigger lives in the flow, so the push carries it.

            Sticky, so the way out travels with you. The switch here is the only
            thing that closes the drawer and the arrow is the only obvious way
            back, and a page of patches is long enough that both used to scroll
            out of reach — leaving the reader to haul themselves back to the top
            to go anywhere.

            `bg-canvas` is load-bearing: the bar had no background of its own,
            which is invisible while it sits at the top of the page and becomes
            content sliding through the letters the moment it stops moving.
            `z-30` puts it over the canvas and under the dog, who is fixed at
            z-50 and should stay on top of everything.

            This works only because the row above uses `overflow-x: clip`
            rather than `hidden` — `hidden` computes `overflow-y` to `auto` and
            would make that row a scroll container, against which `top-0` means
            the top of the row and not the top of the screen. The bar would then
            never stick at all. */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-rule bg-canvas px-3 py-3 sm:px-4">
          <div className="flex items-center gap-2">
            {/* One control, not two.

                This used to only open, which left it doing nothing at all while
                the drawer stood open — a button sitting inches from the drawer's
                own close cross, looking identical to the one that had just
                worked. Now it is the single switch, and it says which way it
                will go: the three bars fold into a cross, so the thing you press
                to close is the thing you pressed to open, in the same place. */}
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              aria-label={navOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={navOpen}
              aria-controls="podshar-nav"
              className="group relative flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded border-2 border-rule transition-colors duration-drape ease-drape hover:bg-sunk"
            >
              {/* Three bars, 2px each, 5px apart: the outer two are 7px off
                  centre, which is exactly how far they travel to meet in the
                  middle as a cross. The hover widths only apply while closed —
                  a cross whose arms grow on hover reads as broken, not lively. */}
              <span
                className={`h-0.5 bg-ink transition-all duration-drape ease-drape ${
                  navOpen
                    ? 'w-5 translate-y-[7px] rotate-45'
                    : 'w-4 group-hover:w-5'
                }`}
              />
              <span
                className={`h-0.5 bg-ink transition-all duration-drape ease-drape ${
                  navOpen ? 'w-5 opacity-0' : 'w-4 group-hover:w-3'
                }`}
              />
              <span
                className={`h-0.5 bg-ink transition-all duration-drape ease-drape ${
                  navOpen
                    ? 'w-5 -translate-y-[7px] -rotate-45'
                    : 'w-4 group-hover:w-5'
                }`}
              />
            </button>

            {/* Back, and only where there is somewhere to go back to. On the
                homepage the arrow would point at the page you are already on.
                The wordmark opposite also goes home, but a wordmark is a
                convention you have to already know; an arrow is not. */}
            {isHome ? null : (
              <Link
                href="/"
                aria-label={t('goBack')}
                className="grid h-11 w-11 shrink-0 place-items-center rounded border-2 border-rule text-ink transition-colors duration-drape ease-drape hover:bg-sunk"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 5 8 12l7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* The wordmark is the way back to the homepage, here and in the
              drawer. It is a link at the call site rather than inside
              `PodsharWordmark`, because the same wordmark heads the login and
              join pages, where "home" is a page you are not allowed on yet and
              the click would land you back on the login screen. */}
          <Link
            href="/"
            aria-label={t('goHome')}
            className="rounded px-2 py-1 transition-colors duration-drape ease-drape hover:bg-sunk"
          >
            <PodsharWordmark className="text-xs font-semibold text-ink-muted" />
          </Link>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>
      </div>

      <RightAIChat />

      {/* Last, and over everything: the dog is fixed at z-50 and a panel that
          slid under him would be a panel you cannot fully read. */}
      {patchesOpen && patches ? (
        <Modal
          title={tPatches('title')}
          hint={tPatches('hint')}
          close={t('close')}
          onClose={() => setPatchesOpen(false)}
        >
          {patches}
        </Modal>
      ) : null}
    </div>
  );
}
