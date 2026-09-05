'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { AssistantAvatar } from './AssistantAvatar';
import { AssistantLauncher } from './AssistantLauncher';

type Message = { id: string; role: 'assistant' | 'user'; text: string };

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
    if (open) panelRef.current?.querySelector('input')?.focus();
  }, [open]);

  return (
    <>
      <aside
        ref={panelRef}
        aria-label={t('name')}
        // Off-screen content stays in the DOM, so without `inert` a keyboard
        // user tabs into a conversation nobody can see.
        inert={!open}
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-[min(23rem,92vw)] flex-col rounded-l-block border-2 border-r-0 border-rule bg-surface transition-transform duration-drape ease-drape ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <ChatBody onClose={() => setOpen(false)} />
      </aside>

      {/* The launcher owns its own position, collapse state and drag. This
          component only says whether the panel is up. */}
      <AssistantLauncher hidden={open} onOpen={() => setOpen(true)} />
    </>
  );
}

function ChatBody({ onClose }: { onClose: () => void }) {
  const t = useTranslations('assistant');
  const locale = useLocale();
  const router = useRouter();

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const logRef = useRef<HTMLDivElement | null>(null);

  // Seed the intro in the active language, and reseed when the language changes.
  useEffect(() => {
    setMessages([{ id: 'intro', role: 'assistant', text: t('intro') }]);
  }, [t, locale]);

  // Keep the newest turn in view.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text }]);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, locale })
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
      <header className="flex items-center gap-3 px-5 py-5">
        <AssistantAvatar className="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-ink">{t('name')}</p>
          <p className="ps-label">{t('role')}</p>
        </div>
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

      <form onSubmit={send} className="flex items-center gap-2 border-t border-rule-soft p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('placeholder')}
          className="min-w-0 flex-1 rounded border-2 border-rule bg-canvas px-3 py-2.5 text-[0.9375rem] text-ink outline-none transition-colors focus:border-ink placeholder:text-ink-faint"
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
