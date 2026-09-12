'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { placeForPath } from '@/lib/navigation';
import { AssistantAvatar } from './AssistantAvatar';
import { AssistantLauncher } from './AssistantLauncher';

type Message = { id: string; role: 'assistant' | 'user'; text: string };

/** How tall the message field may grow before it starts scrolling, in pixels. */
const MAX_FIELD = 120;

/** Where the panel sits and whether it has been unclipped, per browser. */
const STORE_KEY = 'podshar:chat';
/** How much of the panel must stay on screen after a resize, in pixels. */
const EDGE_KEEP = 56;

/**
 * Podshar, the resident assistant.
 *
 * One panel at every width, hidden until asked for, opened by a round button in
 * the bottom-right corner with the dog's face on it — the shape every assistant
 * widget on the web has, and the reason it needs no label to be understood.
 *
 * It was a permanent third column on desktop until v0.5. Two things were wrong
 * with that: the conversation sat there taking a fifth of the screen whether or
 * not anyone was talking to it, and the desktop column and the mobile drawer
 * were separate elements rendering separate `<ChatBody />`s — two message lists,
 * two pieces of state, drifting apart the moment the window crossed `lg`. One
 * fixed panel has neither problem.
 *
 * Fixed rather than a flex sibling, so it floats over the canvas instead of
 * squeezing the bento grid on open. The left drawer still pushes; that one is
 * navigation, and losing your place in the page while picking a destination is
 * the point of a drawer. This is a conversation held beside the page.
 */
export function RightAIChat() {
  const t = useTranslations('assistant');
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  /**
   * Clipped to the edge, or off the leash.
   *
   * Docked, the panel is what it has always been: full height against the right
   * edge, sliding in and out. Released, it becomes a window you can put where
   * you like — because the thing you want to ask the dog about is often exactly
   * what the panel is covering, and a conversation held beside the page should
   * not be the reason you cannot see the page.
   *
   * It clips back by pressing the same catch, and lands where it started rather
   * than wherever it was dropped: docking is a place, not a direction.
   */
  const [free, setFree] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Dragging is started by hand from the header, not by framer-motion's own
  // listener on the whole panel. Otherwise a swipe meant to scroll the
  // conversation picks the window up instead, and selecting a line of the dog's
  // reply drags the room it is written in.
  const dragControls = useDragControls();

  // Read after mount, never during render: the server has no idea where this
  // browser last left the panel, and disagreeing about it is a hydration error
  // on every load.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const v = JSON.parse(raw) as { free?: boolean; x?: number; y?: number };
      if (typeof v.x === 'number') x.set(v.x);
      if (typeof v.y === 'number') y.set(v.y);
      setFree(Boolean(v.free));
    } catch {
      // Blocked storage, or something else under our key. The default corner is
      // a perfectly good place to be.
    }
  }, [x, y]);

  const persist = (next: { free?: boolean; x?: number; y?: number }) => {
    try {
      window.localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ free, x: x.get(), y: y.get(), ...next })
      );
    } catch {
      // It still works for this session.
    }
  };

  // A window made smaller can leave a released panel off the screen, where
  // there is nothing left to grab to bring it back. Measured rather than
  // computed: the panel's own rectangle already accounts for its size, its
  // anchor and however far it has been dragged.
  useEffect(() => {
    if (!free) return;
    const clamp = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      let dx = 0;
      let dy = 0;
      if (r.right < EDGE_KEEP) dx = EDGE_KEEP - r.right;
      else if (r.left > window.innerWidth - EDGE_KEEP) {
        dx = window.innerWidth - EDGE_KEEP - r.left;
      }
      if (r.top < 0) dy = -r.top;
      else if (r.top > window.innerHeight - EDGE_KEEP) {
        dy = window.innerHeight - EDGE_KEEP - r.top;
      }
      if (dx) x.set(x.get() + dx);
      if (dy) y.set(y.get() + dy);
    };
    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [free, x, y]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Move focus into the panel on open, so the keyboard follows the eye.
  useEffect(() => {
    if (open) panelRef.current?.querySelector('textarea')?.focus();
  }, [open]);

  const toggleFree = () => {
    if (free) {
      // Home, not wherever it happened to be left.
      x.set(0);
      y.set(0);
      setFree(false);
      persist({ free: false, x: 0, y: 0 });
      return;
    }
    setFree(true);
    persist({ free: true });
  };

  return (
    <>
      {/* Two elements, one panel. The outer carries the drag offset, which
          framer-motion writes as a transform; the inner carries the open and
          shut transition, which is also a transform. On one element the second
          would overwrite the first, and the panel would either refuse to move
          or refuse to close.

          The wrapper never takes a click of its own: docked and shut it still
          covers a tall strip of the right edge, and an invisible box swallowing
          presses there is a bug nobody would think to look for. */}
      <motion.div
        ref={wrapRef}
        drag={free}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        onDragEnd={() => persist({ x: x.get(), y: y.get() })}
        style={{ x, y }}
        className={`pointer-events-none fixed z-50 ${
          free
            ? 'right-4 top-20 h-[min(34rem,72vh)] w-[min(23rem,92vw)]'
            : 'bottom-0 right-0 top-0 w-[min(23rem,92vw)]'
        }`}
      >
        <aside
          ref={panelRef}
          aria-label={t('name')}
          // Off-screen content stays in the DOM, so without `inert` a keyboard
          // user tabs into a conversation nobody can see.
          inert={!open}
          className={`flex h-full flex-col border-2 border-rule bg-surface transition-[transform,opacity] duration-drape ease-drape ${
            free ? 'rounded-block' : 'rounded-l-block border-r-0'
          } ${
            open
              ? 'pointer-events-auto translate-x-0 opacity-100'
              : free
                ? 'pointer-events-none scale-[0.98] opacity-0'
                : 'pointer-events-none translate-x-full'
          }`}
        >
          <ChatBody
            onClose={() => setOpen(false)}
            free={free}
            onToggleFree={toggleFree}
            onGrab={(e) => {
              if (!free) return;
              // A press on the catch, or on the close cross, is a press — not
              // the beginning of a drag.
              if ((e.target as HTMLElement).closest('button')) return;
              dragControls.start(e);
            }}
          />
        </aside>
      </motion.div>

      {/* The launcher owns its own position, collapse state and drag. This
          component only says whether the panel is up. */}
      <AssistantLauncher hidden={open} onOpen={() => setOpen(true)} />
    </>
  );
}

function ChatBody({
  onClose,
  free,
  onToggleFree,
  onGrab
}: {
  onClose: () => void;
  /** True while the panel is off the edge and can be moved. */
  free: boolean;
  onToggleFree: () => void;
  onGrab: (e: React.PointerEvent) => void;
}) {
  const t = useTranslations('assistant');
  const tGuide = useTranslations('guide');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const logRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);

  // A guide opens by saying where you are standing, not with a menu. The
  // fallback covers a page the map does not describe, which today cannot
  // happen: the shell only wraps routes that exist, and the homepage is the
  // only one of those.
  const here = placeForPath(pathname);
  const opening = here?.status === 'live' ? tGuide(`${here.id}.here`) : t('intro');

  // Reseed whenever that line changes — a new language, or a new page. It also
  // clears the log, which is the right trade while there is exactly one page to
  // stand on. When the second one lands, this is the line to revisit: arriving
  // somewhere should append the dog's remark, not erase the conversation that
  // asked to go there.
  useEffect(() => {
    setMessages([{ id: 'intro', role: 'assistant', text: opening }]);
  }, [opening]);

  // Keep the newest turn in view.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Grow the field down as the text wraps, instead of scrolling the beginning of
  // a sentence out of sight in a one-line box. Height is set from the content's
  // own `scrollHeight`, which is why it has to be cleared to `auto` first:
  // scrollHeight never reports less than the height already set, so without the
  // reset the field would grow and then refuse to shrink when text is deleted.
  //
  // Capped at MAX_FIELD, past which it scrolls. The panel is a fixed column with
  // the conversation above the field, and a box that keeps growing eats the
  // conversation it is a reply to.
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    field.style.height = 'auto';

    // Empty is not "no content": an empty textarea reports the height of its
    // *placeholder*, which wraps to two lines in a panel this narrow. Measured
    // that way the box would open two lines tall and jump shorter at the first
    // keystroke. With nothing typed there is nothing to grow to, so the height
    // is handed back to `rows={1}` — which is also exactly how the single-line
    // input this replaced behaved, placeholder clipped and all.
    if (!input) {
      // `rows={1}` is not load-bearing enough on its own. An empty textarea lays
      // out its *placeholder*, so a placeholder long enough to wrap makes the
      // box two lines tall — which is what happened here, and what a longer
      // translation would quietly do again. One row, computed from the field's
      // own metrics, cannot be talked out of it by the copy.
      const style = getComputedStyle(field);
      const oneRow =
        parseFloat(style.lineHeight) +
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.borderTopWidth) +
        parseFloat(style.borderBottomWidth);
      field.style.height = `${oneRow}px`;
      return;
    }

    // `scrollHeight` counts content and padding but not the border, and the box
    // is `border-box`, so assigning it straight leaves the field two pixels
    // short at the top and bottom and quietly clips the line it is meant to fit.
    const border = field.offsetHeight - field.clientHeight;
    field.style.height = `${Math.min(field.scrollHeight + border, MAX_FIELD)}px`;
  }, [input]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text }]);
    setInput('');
    setBusy(true);

    try {
      // `messages` is the log as it stood before this turn — the state update
      // above has not landed in this closure — so it is exactly the history,
      // with the text being sent carried separately. The opening line is left
      // out: it is the dog describing the page, which the brief already says.
      const history = messages
        .filter((m) => m.id !== 'intro')
        // Capped here as well as on the server. A long enough conversation would
        // otherwise grow past what the endpoint accepts and start coming back as
        // "no connection" — the one failure the fallback cannot cover, because
        // the request never arrives.
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, locale, path: pathname, history })
      });
      if (!res.ok) throw new Error(`assistant responded ${res.status}`);

      const data: { reply: string; route?: string } = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', text: data.reply }
      ]);

      if (data.route) {
        // Give the reply a beat to land before the page changes underneath.
        const target = data.route;
        setTimeout(() => router.push(target), 600);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', text: t('offline') }
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* The header is also the handle. Anywhere else and you would be dragging
          the conversation, which is a thing people select text in. */}
      <header
        onPointerDown={onGrab}
        className={`flex items-center gap-3 px-5 py-5 ${
          free ? 'cursor-grab select-none active:cursor-grabbing' : ''
        }`}
      >
        <AssistantAvatar className="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-ink">{t('name')}</p>
          <p className="ps-label">{free ? t('roleFree') : t('role')}</p>
        </div>

        {/* The catch. Closed, the panel is clipped to the edge; open, it comes
            off and can be put anywhere. One control for both directions,
            because it is one fastening — two buttons would be two things to
            find for what is plainly a single toggle. */}
        <button
          type="button"
          onClick={onToggleFree}
          aria-label={free ? t('dock') : t('undock')}
          aria-pressed={free}
          className={`grid h-9 w-9 place-items-center rounded border-2 transition-colors ${
            free
              ? 'border-ink bg-sunk text-ink'
              : 'border-rule text-ink-muted hover:bg-sunk hover:text-ink'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* A pin: pressed in while docked, pulled out and tilted once the
                panel is loose. The same object in two states, so the button
                shows what it did rather than what it will do next. */}
            {free ? (
              <>
                <path d="M8.5 3.5 15 10l-1.8 1.8a4 4 0 0 0-1 4l-.7.7-6-6 .7-.7a4 4 0 0 0 4-1z" />
                <path d="m5.5 18.5 3.2-3.2" />
              </>
            ) : (
              <>
                <path d="M9 3h6l-1 5 3 3H7l3-3z" />
                <path d="M12 11v10" />
              </>
            )}
          </svg>
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="grid h-9 w-9 place-items-center rounded border-2 border-rule text-base leading-none text-ink-muted transition-colors hover:bg-sunk hover:text-ink"
        >
          &#215;
        </button>
      </header>

      <div
        ref={logRef}
        aria-live="polite"
        className="flex-1 space-y-2 overflow-y-auto border-t border-rule-soft px-5 py-5"
      >
        {messages.map((m) => (
          <p
            key={m.id}
            className={`max-w-[88%] px-3.5 py-2.5 text-[0.9375rem] leading-relaxed ${
              m.role === 'assistant'
                ? 'rounded-block rounded-bl-sm border-2 border-rule bg-sunk text-ink'
                : 'ml-auto rounded-block rounded-br-sm bg-accent font-medium text-accent-ink'
            }`}
          >
            {m.text}
          </p>
        ))}
        {busy ? <p className="ps-label animate-pulse">• • •</p> : null}
      </div>

      {/* `items-end` so the button stays on the last line as the field grows,
          rather than floating in the middle of a four-line message. */}
      <form onSubmit={send} className="flex items-end gap-2 border-t border-rule-soft p-3">
        <textarea
          ref={fieldRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, shift+Enter breaks the line — the arrangement every
            // chat box has, and the reason a textarea here does not cost you the
            // ability to just type and hit return. `isComposing` guards the
            // Enter that only confirms a character being composed.
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          className="min-w-0 flex-1 resize-none overflow-y-auto rounded border-2 border-rule bg-canvas px-3 py-2.5 text-[0.9375rem] leading-relaxed text-ink outline-none transition-colors focus:border-ink placeholder:text-ink-faint"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="ps-label rounded border-2 border-transparent bg-accent px-3.5 py-3 text-accent-ink transition-opacity duration-drape hover:opacity-85 disabled:opacity-30"
        >
          {t('send')}
        </button>
      </form>
    </>
  );
}
