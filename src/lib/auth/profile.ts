'use server';

import { createHash, randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { readSession, destroySession } from '@/lib/auth/session';
import { AVATAR_PRESETS } from '@/components/profile/MemberAvatar';
import { routing } from '@/i18n/routing';

/**
 * Everything the profile page can do.
 *
 * Same contract as the login actions: return `{ error: <translation key> }` or
 * `{ ok: true }`, never a sentence — the page holds the catalogue, the server
 * does not need to know which of the four languages is on screen.
 *
 * Every action re-reads the session itself rather than trusting an id from the
 * form. A hidden field saying "user 3" is a suggestion from the browser; the
 * cookie is the only thing that says who is asking.
 */

export type ProfileState = { error?: string; ok?: boolean };

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/**
 * Handles are the login name and appear as `@handle`, so they are deliberately
 * narrow: lowercase letters, digits, underscore. No dots (they read as domains),
 * no uppercase (two people would pick `Bob` and `bob` and never work out why
 * one of them cannot sign in).
 */
const HANDLE = /^[a-z0-9_]{2,20}$/;

const Identity = z.object({
  displayName: z.string().trim().min(2, 'nameTooShort').max(40),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .refine((v) => HANDLE.test(v), 'badHandle'),
  email: z.string().trim().toLowerCase().email('badEmail').max(200),
  locale: z.enum(routing.locales),
  timeZone: z.string().trim().min(1).max(60),
  avatarPreset: z
    .string()
    .optional()
    .refine((v) => !v || (AVATAR_PRESETS as readonly string[]).includes(v), 'badAvatar')
});

const Passwords = z.object({
  current: z.string().min(1, 'invalid').max(200),
  next: z.string().min(10, 'tooShort').max(200),
  confirm: z.string()
});

async function fingerprint() {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local';
  return { ipHash: sha256(ip), userAgent: h.get('user-agent')?.slice(0, 300) ?? null };
}

/** Name, handle, email, language, time zone, avatar. */
export async function updateIdentity(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await readSession();
  if (!session) return { error: 'signedOut' };

  const parsed = Identity.safeParse({
    displayName: formData.get('displayName'),
    handle: formData.get('handle'),
    email: formData.get('email'),
    locale: formData.get('locale'),
    timeZone: formData.get('timeZone'),
    avatarPreset: formData.get('avatarPreset') || undefined
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'invalid' };
  }

  const { displayName, handle, email, locale, timeZone, avatarPreset } = parsed.data;

  // Handle and email are unique across the site. Checking first turns a raw
  // Postgres constraint violation into a sentence the visitor can act on.
  const clash = await prisma.user.findFirst({
    where: {
      id: { not: session.userId },
      OR: [{ handle }, { email }]
    },
    select: { handle: true, email: true }
  });
  if (clash) return { error: clash.handle === handle ? 'handleTaken' : 'emailTaken' };

  await prisma.user.update({
    where: { id: session.userId },
    data: { displayName, handle, email, locale, timeZone, avatarPreset: avatarPreset ?? null }
  });

  // The drawer and the homepage both render the profile, so the whole tree has
  // to be refreshed, not just this page.
  revalidatePath('/', 'layout');
  return { ok: true };
}

/**
 * Change the password.
 *
 * Every other session is deleted on success. If the reason for changing it was
 * that someone else knows it, leaving their session alive defeats the point —
 * and the person doing the changing keeps their own, so it is not disruptive.
 */
export async function changePassword(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await readSession();
  if (!session) return { error: 'signedOut' };

  const parsed = Passwords.safeParse({
    current: formData.get('current'),
    next: formData.get('next'),
    confirm: formData.get('confirm')
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'invalid' };

  const { current, next, confirm } = parsed.data;
  if (next !== confirm) return { error: 'mismatch' };
  if (next === current) return { error: 'samePassword' };

  const ok = await verifyPassword(session.user.passwordHash, current);
  const { ipHash, userAgent } = await fingerprint();

  if (!ok) {
    await prisma.auditLog.create({
      data: { action: 'password_change_failed', userId: session.userId, ipHash, userAgent }
    });
    return { error: 'wrongCurrent' };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: await hashPassword(next) }
    }),
    prisma.session.deleteMany({
      where: { userId: session.userId, NOT: { id: session.id } }
    }),
    prisma.auditLog.create({
      data: { action: 'password_changed', userId: session.userId, ipHash, userAgent }
    })
  ]);

  return { ok: true };
}

/** How long a fresh invite stays good for. */
const INVITE_DAYS = 14;

/**
 * Issue an invite, and hand back the token once.
 *
 * Only the owner. The invite table is the entire allowlist, so this is the one
 * control on the site that decides who else can exist — and until now it lived
 * in a seed script, which meant every expired token needed a developer.
 *
 * The token is returned in the response and never stored: the database keeps
 * only its SHA-256, exactly like the seeded ones. Lose the window, issue
 * another.
 */
export async function createInvite(
  _prev: { token?: string; error?: string },
  formData: FormData
): Promise<{ token?: string; error?: string }> {
  const session = await readSession();
  if (!session) return { error: 'signedOut' };
  if (session.user.role !== 'OWNER') return { error: 'ownerOnly' };

  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().email('badEmail').max(200),
      handle: z
        .string()
        .trim()
        .toLowerCase()
        .refine((v) => HANDLE.test(v), 'badHandle')
    })
    .safeParse({ email: formData.get('inviteEmail'), handle: formData.get('inviteHandle') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'invalid' };

  const { email, handle } = parsed.data;

  // A handle or address already in use — by a member or by an invite nobody has
  // claimed yet — would collide the moment it was redeemed.
  const [userClash, inviteClash] = await Promise.all([
    prisma.user.findFirst({ where: { OR: [{ handle }, { email }] }, select: { id: true } }),
    prisma.invite.findFirst({
      where: { claimedAt: null, OR: [{ handle }, { email }] },
      select: { id: true }
    })
  ]);
  if (userClash || inviteClash) return { error: 'alreadyInvited' };

  const token = randomBytes(24).toString('base64url');
  const { ipHash, userAgent } = await fingerprint();

  await prisma.$transaction([
    prisma.invite.create({
      data: {
        email,
        handle,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000)
      }
    }),
    prisma.auditLog.create({
      data: {
        action: 'invite_created',
        userId: session.userId,
        ipHash,
        userAgent,
        metadata: { handle }
      }
    })
  ]);

  return { token };
}

/** Sign out everywhere else, without changing the password. */
export async function revokeOtherSessions(): Promise<ProfileState> {
  const session = await readSession();
  if (!session) return { error: 'signedOut' };

  const { count } = await prisma.session.deleteMany({
    where: { userId: session.userId, NOT: { id: session.id } }
  });
  await prisma.auditLog.create({
    data: { action: 'sessions_revoked', userId: session.userId, metadata: { count } }
  });

  return { ok: true };
}

/** Sign out here, used by the profile page's own button. */
export async function endSession(): Promise<void> {
  await destroySession();
}
