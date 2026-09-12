'use client';

import { useEffect, useRef } from 'react';

/**
 * A page shown over the page you were already on.
 *
 * The page behind stays where it is, blurred and dimmed, and the panel scrolls
 * on its own. Nothing here navigates: the panel is opened and closed by the
 * component that owns it, and the address bar does not change. Whatever is
 * shown this way must therefore also exist as a real page — a panel is a
 * convenience for the person already here, never the only way to reach
 * something.
 *
 * The panel scrolls, not the layer around it. Scrolling the outer layer left a
 * strip of the content showing above the sticky header, in the gap that
 * layer's own padding opens, and put the scrollbar against the edge of the
 * window rather than against the thing being read.
 */
export function Modal({
  children,
  title,
  hint,
  close,
  onClose
}: {
  children: React.ReactNode;
  /** The heading, which is also what a screen reader announces. */
  title: string;
  /** One quiet line under it, if there is one worth saying. */
  hint?: string;
  /** The close button's label. */
  close: string;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement | null>(null);

  // The callback lives in a ref so the effect below can run exactly once.
  // Depending on `onClose` directly would re-run it on every render of the
  // component that owns this panel — and re-running it moves focus back to the
  // panel, yanking it away from whatever the reader had just tabbed to.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKey);

    // The page underneath must not scroll while a panel is over it — otherwise
    // a flick on a phone moves the homepage behind the thing being read.
    // Padding replaces the scrollbar's width so the layout does not jump on
    // desktops that reserve space for one.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    // Focus goes to the panel, not to the close button: the first thing a
    // screen reader should hear is what opened, not how to shut it.
    panel.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
      {/* The page behind, blurred and dimmed. A button rather than a div, so
          clicking away is reachable by keyboard and announced as what it does
          instead of being a silent trap for anyone not using a mouse. */}
      <button
        type="button"
        aria-label={close}
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-ink/25 backdrop-blur-[3px]"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        // Rounder than a bento card on purpose: a panel floating over a blurred
        // page is not one of the blocks in the grid, and the softer corner is what
        // says so. No shadow — nothing on this site casts one, and the dimmed,
        // blurred page behind already lifts the panel off it.
        className="animate-rise-in scroll-quiet relative max-h-full w-full max-w-3xl overflow-y-auto overscroll-contain rounded-[20px] border-2 border-rule bg-surface outline-none"
      >
        {/* The title travels with the close button rather than scrolling away
            under it. A sticky strip carrying only the cross left the heading to
            slide beneath a half-transparent bar, which reads as a rendering
            fault. Opaque, and a rule underneath, so the list passing below has
            a clean edge to pass under. */}
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[18px] border-b border-rule-soft bg-surface px-6 py-4 sm:px-10">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold leading-tight text-ink">{title}</h2>
            {hint ? <p className="ps-label mt-1">{hint}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={close}
            className="grid h-10 w-10 shrink-0 place-items-center rounded border-2 border-rule text-lg leading-none text-ink-muted transition-colors duration-drape ease-drape hover:bg-sunk hover:text-ink"
          >
            &#215;
          </button>
        </header>

        <div className="px-6 pb-8 pt-2 sm:px-10">{children}</div>
      </div>
    </div>
  );
}
