'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { PodsharMark } from './PodsharMark';

type Message = { id: string; role: 'assistant' | 'user'; text: string };

/**
 * Podshar, the resident assistant.
 *
 * Desktop: a real third column, a flex sibling of the canvas, always present.
 * Mobile: that column is gone entirely and a floating button slides the same
 * panel in from the right edge.
 *
 * Both surfaces render one `<ChatBody />`, so the conversation never has two
 * implementations that can drift.
 */
export function RightAIChat() {
  const t = useTranslations('assistant');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Desktop: persistent column */}
      <aside
        aria-label={t('name')}
        className="hidden w-chat shrink-0 border-l border-rule bg-canvas lg:flex lg:flex-col"
      >
        <ChatBody />
      </aside>

      {/* Mobile: slide-in panel over the canvas */}
      <aside
        aria-label={t('name')}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(21rem,88vw)] flex-col border-l border-ink bg-canvas transition-transform duration-drape ease-drape lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <ChatBody onClose={() => setOpen(false)} />
      </aside>

      {/* Mobile: the launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('close') : t('open')}
        aria-expanded={open}
        className={`fixed bottom-4 right-4 z-50 grid h-14 w-14 place-items-center border border-ink bg-sand text-ink shadow-block transition-all duration-drape ease-drape hover:bg-clay hover:text-canvas lg:hidden ${
          open ? 'pointer-events-none scale-90 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <PodsharMark className="h-7 w-7" animated />
      </button>
    </>
  );
}

function ChatBody({ onClose }: { onClose?: () => void }) {
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
      <header className="flex items-center gap-3 px-5 py-6">
        <div className="grid h-11 w-11 shrink-0 place-items-center border border-ink bg-sand text-ink">
          <PodsharMark className="h-6 w-6" animated />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-[0.12em] text-ink">{t('name')}</p>
          <p className="ps-label">{t('role')}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="grid h-8 w-8 place-items-center border border-rule text-sm leading-none text-ink-muted transition-colors hover:bg-sand hover:text-ink"
          >
            &#215;
          </button>
        ) : null}
      </header>

      <div
        ref={logRef}
        aria-live="polite"
        className="flex-1 space-y-2 overflow-y-auto border-t border-rule px-5 py-5"
      >
        {messages.map((m) => (
          <p
            key={m.id}
            className={`max-w-[88%] border px-3 py-2 text-sm leading-relaxed ${
              m.role === 'assistant'
                ? 'border-rule bg-sand text-ink'
                : 'ml-auto border-ink bg-clay text-canvas'
            }`}
          >
            {m.text}
          </p>
        ))}
        {busy ? <p className="ps-label animate-pulse">• • •</p> : null}
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-rule p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('placeholder')}
          className="min-w-0 flex-1 border border-rule bg-canvas px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink placeholder:text-ink-faint"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="ps-label border border-ink bg-sand px-3 py-2.5 text-ink transition-colors duration-drape hover:bg-clay hover:text-canvas disabled:opacity-40 disabled:hover:bg-sand disabled:hover:text-ink"
        >
          {t('send')}
        </button>
      </form>
    </>
  );
}
