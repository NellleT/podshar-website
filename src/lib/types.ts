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
