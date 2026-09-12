import 'server-only';

import { prisma } from '@/lib/db';
import { authConfigured } from '@/lib/auth/config';
import type { Departure, TrainRow } from '@/lib/types';

/**
 * The next train home from Zürich HB, for each of the three.
 *
 * Built on what the schema already had: every user may point at a `Location`
 * through `homeLocationId`, and a location carries an SBB stop id. Each person
 * sets theirs once on the profile page; this reads them and asks SBB for the
 * next few connections from HB. No migration.
 *
 * transport.opendata.ch, because it needs no key — the same reasoning as the
 * weather, and fenced the same way (`lib/weather.ts` has the long version):
 * cached for a minute, streamed in behind Suspense, and a failure is a row that
 * says SBB did not answer rather than an error. A minute is the right cache for
 * a departure board: long enough that three people reloading do not hammer it,
 * short enough that the train on screen is still in the station. The tile picks
 * the first connection still in the future itself, so a cached answer that has
 * gone a minute stale shows the next train, not one that has left.
 */

/** Zürich HB — where every row starts, and the stop the seed calls home. */
export const HB_STOP = '8503000';
const API = 'https://transport.opendata.ch/v1';
const TIMEOUT_MS = 3000;

async function sbb(path: string, params: Record<string, string>, revalidate: number) {
  const url = new URL(`${API}/${path}`);
  url.search = new URLSearchParams(params).toString();

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // A race rather than an abort, so a slow answer still lands in the cache.
    const response = await Promise.race([
      fetch(url, { next: { revalidate } }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`no answer in ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
      })
    ]);
    if (!response.ok) throw new Error(`SBB answered ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

const time = (iso: unknown) => (typeof iso === 'string' ? Date.parse(iso) : NaN);

/** The next few connections from HB to a stop, soonest first. Throws if SBB does not answer. */
export async function fromHB(to: string): Promise<Departure[]> {
  const data = await sbb('connections', { from: HB_STOP, to, limit: '4' }, 60);
  const out: Departure[] = [];

  for (const c of Array.isArray(data?.connections) ? data.connections : []) {
    const departs = time(c?.from?.departure);
    const arrives = time(c?.to?.arrival);
    if (!Number.isFinite(departs) || !Number.isFinite(arrives)) continue;
    const journey = c?.sections?.find((s: { journey?: unknown }) => s?.journey)?.journey;
    out.push({
      line:
        (typeof c?.products?.[0] === 'string' && c.products[0]) ||
        [journey?.category, journey?.number].filter(Boolean).join(' ') ||
        '?',
      departs,
      delay: Number.isFinite(c?.from?.delay) ? Math.max(0, c.from.delay) : 0,
      platform: typeof c?.from?.platform === 'string' && c.from.platform ? c.from.platform : null,
      arrives,
      transfers: Number.isFinite(c?.transfers) ? c.transfers : 0
    });
  }

  return out.sort((a, b) => a.departs - b.departs);
}

export async function getTrains(): Promise<TrainRow[]> {
  if (!authConfigured()) return [];

  let users;
  try {
    users = await prisma.user.findMany({
      select: {
        handle: true,
        displayName: true,
        avatarPreset: true,
        homeLocation: { select: { label: true, stopId: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
  } catch (error) {
    console.warn('[podshar] trains: could not read members:', error);
    return [];
  }

  return Promise.all(
    users.map(async (user): Promise<TrainRow> => {
      const row: TrainRow = {
        handle: user.handle,
        displayName: user.displayName,
        avatarPreset: user.avatarPreset,
        station: user.homeLocation?.label ?? null,
        atHB: false,
        departures: [],
        failed: false
      };

      const stop = user.homeLocation?.stopId;
      if (!stop) return { ...row, station: null };
      if (stop === HB_STOP) return { ...row, atHB: true };

      try {
        return { ...row, departures: await fromHB(stop) };
      } catch (error) {
        console.warn(`[podshar] SBB did not answer for ${stop}:`, error instanceof Error ? error.message : error);
        return { ...row, failed: true };
      }
    })
  );
}

/**
 * A typed name, resolved to a station — for the profile form.
 *
 * The first match is taken, and the form says out loud which station it
 * found. "Oerlikon" becoming "Zürich Oerlikon" is the right guess; the one time
 * it guesses wrong, the person sees it immediately and types more.
 */
export async function findStation(
  query: string
): Promise<{ id: string; name: string; latitude: number; longitude: number } | null> {
  // Station names do not move: a day's cache is generous and still harmless.
  const data = await sbb('locations', { query, type: 'station' }, 86_400);
  const station = (Array.isArray(data?.stations) ? data.stations : []).find(
    (s: { id?: unknown; name?: unknown }) => s?.id && typeof s?.name === 'string'
  );
  if (!station) return null;

  return {
    id: String(station.id),
    name: station.name,
    // SBB's WGS84 "x" is the latitude and "y" the longitude — the reverse of
    // what the letters suggest.
    latitude: Number(station.coordinate?.x) || 0,
    longitude: Number(station.coordinate?.y) || 0
  };
}
