/**
 * Shapes shared between server data access and client components.
 *
 * These live here rather than in a component file so `session.ts` (which is
 * `server-only`) never has to import from a `'use client'` module to get a type.
 */

export type MemberProfile = {
  displayName: string;
  handle: string;
  avatarUrl?: string | null;
  /** One of the built-in marks, or null for initials. */
  avatarPreset?: string | null;
};

export type QuickStats = {
  dotaPts: number | null;
  brawlCups: number | null;
};

/** One person, as the "who is here" tile sees them. */
export type PresenceEntry = {
  handle: string;
  displayName: string;
  avatarPreset: string | null;
  /** Epoch milliseconds, or null for someone not seen since this was built. */
  lastSeen: number | null;
};

/** One way home from Zürich HB, as SBB reports it. */
export type Departure = {
  /** What is written on the train: "S11", "IC 5". */
  line: string;
  /** Scheduled departure, epoch milliseconds. */
  departs: number;
  /** Minutes late as SBB reports it; 0 when on time or not known. */
  delay: number;
  platform: string | null;
  arrives: number;
  transfers: number;
};

/** One person's row in the train tile. */
export type TrainRow = {
  handle: string;
  displayName: string;
  avatarPreset: string | null;
  /** Their home station's name, or null if they have not set one. */
  station: string | null;
  /** Their station is Zürich HB itself — there is no train to catch. */
  atHB: boolean;
  /** The next few connections, soonest first. */
  departures: Departure[];
  /** SBB was asked and did not answer. */
  failed: boolean;
};
