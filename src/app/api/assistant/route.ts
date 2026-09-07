import { NextResponse } from 'next/server';
import { z } from 'zod';

import { HOME, placeForPath } from '@/lib/navigation';
import { guestModeAllowed } from '@/lib/auth/config';
import { readSession } from '@/lib/auth/session';
import { buildBrief } from '@/lib/assistant/brief';
import { answerWithoutModel } from '@/lib/assistant/fallback';
import { askPodshar, modelConfigured, type Turn } from '@/lib/assistant/model';
import { withinDailyLimit } from '@/lib/assistant/quota';

export const runtime = 'nodejs';

const Body = z.object({
  message: z.string().min(1).max(2000),
  locale: z.enum(['en', 'ru', 'uk', 'de']),
  /** Where the asker is standing, locale prefix already stripped by next-intl. */
  path: z.string().max(200).default('/'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000)
      })
    )
    // Deliberately looser than the window the model actually gets: `model.ts`
    // takes the last few turns itself. A cap that merely trims is better than
    // one that 400s the moment the browser and the server disagree by one.
    .max(40)
    .default([])
});

/**
 * The assistant endpoint.
 *
 * Two halves, and the second one is a safety net rather than a feature: the
 * model answers, and if it cannot — no key, no balance, rate limit, a refusal,
 * a network blip — the keyword router answers instead. The panel never shows an
 * error and the site never depends on a third party being up.
 *
 * **This route is behind the session check on purpose.** It was open to the
 * internet while every answer was a lookup table, which cost nothing. With a
 * model behind it, an open endpoint is a stranger spending our API balance in a
 * loop. The check mirrors `(app)/layout.tsx`: guest mode is a development
 * convenience for running without a database, and is never true in production.
 *
 * Failing to read a session is treated as no session, which matters for the
 * misconfigured deploy — no `DATABASE_URL` in production makes `readSession`
 * throw, and throwing must close the door, not open it.
 */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const { message, locale, path, history } = parsed.data;

  let who = 'dev';
  let member = 'Guest';
  if (!guestModeAllowed()) {
    const session = await readSession().catch(() => null);
    if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    who = session.userId;
    member = session.user.displayName;
  }

  // `path` arrives from the browser, so it can name a place that is not built.
  // Falling back to the homepage keeps the `guide.<id>.here` invariant true:
  // only a live place is ever asked to describe itself.
  const found = placeForPath(path);
  const here = found?.status === 'live' ? found : HOME;

  if (modelConfigured() && withinDailyLimit(who)) {
    const brief = await buildBrief({ locale, member, here });
    const answer = await askPodshar({
      brief,
      history: history as Turn[],
      message
    });
    if (answer) return NextResponse.json(answer);
  }

  return NextResponse.json(await answerWithoutModel({ locale, message, here }));
}
