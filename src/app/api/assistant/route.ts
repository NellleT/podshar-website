import { NextResponse } from 'next/server';
import { z } from 'zod';

import { NAV_GROUPS } from '@/lib/navigation';

export const runtime = 'nodejs';

const Body = z.object({
  message: z.string().min(1).max(2000),
  locale: z.enum(['en', 'ru', 'uk', 'de'])
});

/**
 * Assistant endpoint.
 *
 * Deliberately shipped in two halves. The navigator half is deterministic
 * keyword routing, which costs nothing and is right far more often than a
 * model would be for "take me to the memes". The conversational half is the
 * model call, and it only runs when routing finds nothing.
 *
 * TODO(Phase 4): replace the fallback with a streaming call carrying the group
 * tone prompt, and give the model the nav table as a tool so it can route too.
 */

const ROUTE_HINTS: Array<{ href: string; terms: string[] }> = [
  { href: '/memes', terms: ['meme', 'мем', 'мемы', 'мемів', 'feed'] },
  { href: '/gallery', terms: ['gallery', 'photo', 'галере', 'фото', 'galerie'] },
  { href: '/music', terms: ['music', 'spotify', 'soundcloud', 'музык', 'музик', 'musik'] },
  { href: '/ballick', terms: ['ballick', 'balance', 'crypto', 'баланс', 'крипт'] },
  { href: '/traphouse', terms: ['trap', 'apartment', 'flat', 'квартир', 'wohnung'] },
  { href: '/map', terms: ['map', 'war', 'ukraine', 'карт', 'війн', 'война'] },
  { href: '/games', terms: ['game', 'tetris', 'chess', 'durak', 'игр', 'ігр', 'spiel'] },
  { href: '/stats', terms: ['dota', 'brawl', 'mmr', 'stat', 'статист'] },
  { href: '/radar', terms: ['fashion', 'perfume', 'fragrance', 'мода', 'парфюм', 'mode', 'duft'] },
  { href: '/todos', terms: ['todo', 'task', 'задач', 'завданн', 'aufgabe'] },
  { href: '/gym', terms: ['gym', 'зал', 'workout', 'trening'] },
  { href: '/calendar', terms: ['calendar', 'календар', 'kalender'] }
];

const ACK: Record<string, string> = {
  en: 'Taking you there.',
  ru: 'Веду тебя туда.',
  uk: 'Веду тебе туди.',
  de: 'Ich bringe dich hin.'
};

const UNSURE: Record<string, string> = {
  en: 'Not wired up yet. Try naming a section.',
  ru: 'Пока не подключено. Назови раздел.',
  uk: 'Ще не підключено. Назви розділ.',
  de: 'Noch nicht angebunden. Nenn einen Bereich.'
};

const KNOWN_ROUTES = new Set(NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href)));

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const { message, locale } = parsed.data;
  const haystack = message.toLowerCase();

  const hit = ROUTE_HINTS.find((entry) =>
    entry.terms.some((term) => haystack.includes(term))
  );

  if (hit && KNOWN_ROUTES.has(hit.href)) {
    return NextResponse.json({ reply: ACK[locale], route: hit.href });
  }

  return NextResponse.json({ reply: UNSURE[locale] });
}
