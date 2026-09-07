import Anthropic from '@anthropic-ai/sdk';

import { ALL_PLACES } from '@/lib/navigation';

/**
 * Which model answers as Podshar.
 *
 * Sonnet, by the owner's call, after Opus looked expensive. It holds the voice
 * noticeably less well on its own, which is why the brief below carries far more
 * explicit instruction than a stronger model would need — that is the trade, and
 * it is a fair one at a fifth of the price.
 *
 * This is the cost dial and the only line that needs changing: add the model to
 * `PRICE_PER_MTOK` and nothing else here is model-specific.
 */
const MODEL: keyof typeof PRICE_PER_MTOK = 'claude-sonnet-5';

/**
 * Generous on purpose, and not a cost control.
 *
 * Thinking tokens are drawn from the same allowance as the reply, so a tight cap
 * does not buy a short answer — it buys an answer truncated mid-sentence once
 * the model happens to think for a moment. Brevity is asked for in the brief,
 * where it belongs; billing only counts what is actually produced, and a pug
 * told to say one sentence does not say two thousand tokens.
 */
const MAX_TOKENS = 2000;

/** Live destinations, which is also the only set the navigate tool will accept. */
const LIVE_HREFS = ALL_PLACES.filter((p) => p.status === 'live').map((p) => p.href);

/**
 * The one tool he has.
 *
 * The enum is the whole point: a model asked to produce a URL will eventually
 * produce a plausible one that 404s. Here the only values that exist are the
 * pages that exist, and `strict` makes the API enforce that rather than trusting
 * the model to have read the brief.
 */
const NAVIGATE: Anthropic.Beta.BetaTool = {
  name: 'navigate',
  description:
    'Take the person to a page of this site. Only call this when they actually want to go somewhere.',
  input_schema: {
    type: 'object',
    properties: {
      href: { type: 'string', enum: LIVE_HREFS, description: 'The page to open.' }
    },
    required: ['href'],
    additionalProperties: false
  },
  strict: true
};

/**
 * Dollars per million tokens, per model.
 *
 * A snapshot, not a source of truth — Anthropic's price list is. It exists so
 * the log line below reads in money rather than in tokens: "this message cost
 * $0.002" is a sentence the owner of this site can act on, and "1576
 * cache_read_input_tokens" is not.
 *
 * Keyed by model deliberately. A single flat table silently lies the moment
 * someone moves the dial above — which is exactly what happened once here, and
 * it under-reported by two and a half times. Cached reads bill at a tenth.
 */
const PRICE_PER_MTOK = {
  // `serverFallbacks`: whether the model accepts the server-side retry that
  // rescues a safety refusal. Opus does; Sonnet answers a request carrying it
  // with a flat 400, which is a whole afternoon of the dog being mysteriously
  // stupid if you assume the parameter is harmless everywhere. It rides here so
  // that switching the dial above cannot leave it behind.
  'claude-opus-5': { input: 5, output: 25, serverFallbacks: true },
  'claude-sonnet-5': { input: 2, output: 10, serverFallbacks: false },
  'claude-haiku-4-5': { input: 1, output: 5, serverFallbacks: false }
} as const;

/**
 * One line per answer, in money.
 *
 * Worth the noise: the bill is the one thing about this feature nobody can see
 * from the outside, and a guess about it — mine included — has already been
 * wrong once. Watch `cached`: it should carry nearly the whole prompt. If it
 * ever drops to zero, something that changes per request has crept into the
 * brief and the price roughly triples.
 */
function logSpend(usage: Anthropic.Beta.BetaUsage) {
  const price = PRICE_PER_MTOK[MODEL];
  const cached = usage.cache_read_input_tokens ?? 0;
  const written = usage.cache_creation_input_tokens ?? 0;
  // Three different rates: fresh input, a cached read at a tenth, and writing
  // the cache at a quarter over input — that write is why the first message
  // after a quiet spell costs several times the ones that follow it.
  const dollars =
    (usage.input_tokens * price.input +
      written * price.input * 1.25 +
      cached * price.input * 0.1 +
      usage.output_tokens * price.output) /
    1_000_000;

  console.log(
    `[podshar] ${MODEL} · in ${usage.input_tokens} (+${cached} cached) · ` +
      `out ${usage.output_tokens} · ~$${dollars.toFixed(4)}`
  );
}

export type Turn = { role: 'user' | 'assistant'; content: string };
export type Answer = { reply: string; route?: string };

/** How much of the conversation travels with each turn. Four exchanges is enough
 *  for "and what about that one" to make sense, and cheap enough to send always. */
const HISTORY_TURNS = 8;

/**
 * Trim the log into something the API will accept.
 *
 * The rule it does not bend on is that a conversation starts with a `user` turn.
 * The panel opens with the dog describing the page, so the log always *begins*
 * with an assistant turn — sent as-is that is a 400, which would silently demote
 * every reply to the keyword fallback and look like the model being stupid
 * rather than absent. Enforced here rather than in the browser because this is
 * the module that talks to the API, and a client is not a place to keep someone
 * else's invariants.
 */
function usableHistory(history: Turn[]): Anthropic.Beta.BetaMessageParam[] {
  const recent = history.slice(-HISTORY_TURNS);
  const start = recent.findIndex((turn) => turn.role === 'user');
  if (start === -1) return [];

  return recent
    .slice(start)
    .map((turn) => ({ role: turn.role, content: turn.content }));
}

/** True when there is a key to spend. Without one the caller falls back. */
export const modelConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

/**
 * The reply, as one run of text.
 *
 * Whitespace is flattened because the chat bubble is a single `<p>`: HTML
 * collapses the line breaks anyway, so a stray blank line becomes an invisible
 * double space rather than the paragraph the model intended. Normalising here
 * means the string we store, log and send is the string that gets read. The
 * brief already asks for one or two sentences; this is what makes the occasional
 * drift harmless instead of scruffy.
 */
function textOf(content: Anthropic.Beta.BetaContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
    .map((block) => block.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function navigationIn(content: Anthropic.Beta.BetaContentBlock[]) {
  return content.find(
    (block): block is Anthropic.Beta.BetaToolUseBlock =>
      block.type === 'tool_use' && block.name === 'navigate'
  );
}

/**
 * Ask Podshar. Returns `null` for every failure, so the caller can fall back to
 * the keyword router instead of showing an error: a dumber dog is a much better
 * outcome than a broken one, and the person on the other end cannot tell which
 * half answered.
 *
 * Thinking stays on with effort turned down. Turning it off on this model has a
 * documented failure mode where the tool call is written into the visible text
 * instead of being made — which here would mean the dog saying "taking you
 * there" while the page never changes.
 */
export async function askPodshar({
  brief,
  history,
  message
}: {
  brief: string;
  history: Turn[];
  message: string;
}): Promise<Answer | null> {
  if (!modelConfigured()) return null;

  // A key created without a workspace is rejected — "not scoped to a workspace"
  // — unless the request names one. A key made *inside* a workspace carries that
  // itself and needs nothing here, which is why this is optional and why the
  // simpler fix is usually a differently-created key. Kept because this is the
  // wall the project actually walked into, not a hypothetical one.
  const workspace = process.env.ANTHROPIC_WORKSPACE_ID;
  const client = new Anthropic(
    workspace ? { defaultHeaders: { 'anthropic-workspace-id': workspace } } : {}
  );
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...usableHistory(history),
    { role: 'user' as const, content: message }
  ];

  // If a safety classifier declines a turn, the same request is retried
  // server-side on another model instead of the dog going quiet. Costs nothing
  // when it never fires, which here is nearly always — but only Opus takes it.
  const rescue: Pick<
    Anthropic.Beta.Messages.MessageCreateParamsNonStreaming,
    'betas' | 'fallbacks'
  > = PRICE_PER_MTOK[MODEL].serverFallbacks
    ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }
    : {};

  const ask = (turns: Anthropic.Beta.BetaMessageParam[]) =>
    client.beta.messages.create({
      ...rescue,
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // The brief is identical on every turn, so it is worth caching: it is by
      // far the largest part of the request and it never changes within a day.
      system: [{ type: 'text', text: brief, cache_control: { type: 'ephemeral' } }],
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      tools: [NAVIGATE],
      messages: turns
    });

  try {
    const first = await ask(messages);
    logSpend(first.usage);
    if (first.stop_reason === 'refusal') return null;

    const nav = navigationIn(first.content);
    const said = textOf(first.content);

    // Usually he says something *and* calls the tool, which is one round trip.
    if (said) return { reply: said, route: nav?.input ? String((nav.input as { href: string }).href) : undefined };

    // He only moved. Hand the tool its result so he can also say something —
    // arriving somewhere in silence reads like the site glitched.
    if (nav) {
      const second = await ask([
        ...messages,
        { role: 'assistant', content: first.content },
        {
          role: 'user',
          content: [{ type: 'tool_result', tool_use_id: nav.id, content: 'done' }]
        }
      ]);
      logSpend(second.usage);
      const followUp = textOf(second.content);
      if (followUp) {
        return { reply: followUp, route: String((nav.input as { href: string }).href) };
      }
    }

    return null;
  } catch (error) {
    // No key, no balance, rate limit, network, a malformed request — all the
    // same from here: the keyword router answers instead and the person sees a
    // reply either way. But they are not the same to whoever has to work out
    // why the dog went stupid, and a silent downgrade is unfixable. This line
    // is the only place that distinction survives; on Vercel it lands in the
    // function log.
    console.warn(
      '[podshar] model call failed, falling back to the keyword table:',
      error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error
    );
    return null;
  }
}
