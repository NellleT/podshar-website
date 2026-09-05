'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession, readSession } from '@/lib/auth/session';
import { redirect } from '@/i18n/routing';
import { resolveLocale } from '@/lib/locale';

/**
 * The three actions behind the login and join forms.
 *
 * They return `{ error: <translation key> }` rather than a message: the caller
 * is a client component that already has the catalogue, so the server never
 * has to know which of the four languages the visitor is reading. On success
 * they do not return at all — `redirect` throws.
 *
 * Failures are deliberately vague. "Wrong handle or password" and "no such
 * handle" are the same string here, because the second one tells an attacker
 * which of the three handles exist.
 */

export type AuthState = { error?: string };

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/** Password rules: length only. Composition rules push people toward
 *  `Password1!` and buy nothing; length is what actually costs an attacker. */
const password = z.string().min(10, 'tooShort').max(200);

const LoginInput = z.object({
  identifier: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(200)
});

const JoinInput = z.object({
  token: z.string().trim().min(10).max(200),
  displayName: z.string().trim().min(2, 'nameTooShort').max(40),
  password,
  confirm: z.string()
});

/**
 * A hashed client address, for the audit log.
 *
 * Hashed rather than stored raw: the log exists to spot someone hammering the
 * form, which needs only equality, not the address itself. `x-forwarded-for`
 * is a list when proxies chain; the first entry is the client.
 */
async function clientFingerprint() {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || h.get('x-real-ip') || 'local';
  return { ipHash: sha256(ip), userAgent: h.get('user-agent')?.slice(0, 300) ?? null };
}

/**
 * A real argon2id hash, of 32 random bytes nobody has ever seen.
 *
 * Its only job is to give `verifyPassword` genuine work to do when the account
 * does not exist, so both branches of a failed login cost the same ~50ms. It
 * has to be a *valid* hash: a made-up string makes `verify` throw on parse and
 * return instantly, which restores exactly the timing difference this exists to
 * remove — a missing handle answering faster than a wrong password is how you
 * find out which of three handles are real.
 */
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$zE4p1TDtJRM7JDeLkHNa7Q$ge6KJ9M88bgs0qJaIyqltiMCcn2/XVLgaCDUe1l0NuU';

/** Failed logins allowed from one address before it has to wait. */
const MAX_FAILURES = 8;
const WINDOW_MINUTES = 10;

async function isRateLimited(ipHash: string) {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000);
  const failures = await prisma.auditLog.count({
    where: { action: 'login_failed', ipHash, createdAt: { gte: since } }
  });
  return failures >= MAX_FAILURES;
}

export async function login(
  locale: string,
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = LoginInput.safeParse({
    identifier: formData.get('identifier'),
    password: formData.get('password')
  });
  if (!parsed.success) return { error: 'invalid' };

  const { ipHash, userAgent } = await clientFingerprint();
  if (await isRateLimited(ipHash)) return { error: 'tooMany' };

  const { identifier, password: plain } = parsed.data;
  // One field for both, because with three users nobody remembers which they
  // registered with. `handle` is stored lowercase; emails are matched as given.
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ handle: identifier.toLowerCase() }, { email: identifier.toLowerCase() }]
    }
  });

  // Verify even when there is no such user — see DUMMY_HASH.
  const stored = user?.passwordHash ?? DUMMY_HASH;
  const ok = await verifyPassword(stored, plain);

  if (!user || !ok) {
    await prisma.auditLog.create({
      data: { action: 'login_failed', ipHash, userAgent, metadata: { identifier } }
    });
    return { error: 'badCredentials' };
  }

  await createSession(user.id);
  await Promise.all([
    prisma.auditLog.create({
      data: { action: 'login_ok', userId: user.id, ipHash, userAgent }
    }),
    prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } })
  ]);

  redirect({ href: '/', locale: resolveLocale(locale) });
  // `redirect` throws to unwind the request, so nothing below it runs. It is
  // typed as returning void rather than never, though, so the type checker
  // still wants an ending return; this is that and nothing more.
  return {};
}

export async function join(
  locale: string,
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = JoinInput.safeParse({
    token: formData.get('token'),
    displayName: formData.get('displayName'),
    password: formData.get('password'),
    confirm: formData.get('confirm')
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'invalid' };
  }

  const { token, displayName, password: plain, confirm } = parsed.data;
  if (plain !== confirm) return { error: 'mismatch' };

  const { ipHash, userAgent } = await clientFingerprint();

  // The invite table is the entire allowlist: an unknown, spent or expired
  // token is the only thing standing between three accounts and four.
  const invite = await prisma.invite.findUnique({ where: { tokenHash: sha256(token) } });
  if (!invite || invite.claimedAt || invite.expiresAt.getTime() <= Date.now()) {
    await prisma.auditLog.create({ data: { action: 'join_rejected', ipHash, userAgent } });
    return { error: 'badToken' };
  }

  const resolved = resolveLocale(locale);

  // One transaction: claiming the invite and creating the user have to succeed
  // or fail together, or a crash between them burns an invite for nobody.
  const user = await prisma.$transaction(async (tx) => {
    const claimed = await tx.invite.updateMany({
      // `claimedAt: null` in the filter makes this the concurrency guard too:
      // two submissions racing, only one matches a row and updates it.
      where: { id: invite.id, claimedAt: null },
      data: { claimedAt: new Date() }
    });
    if (claimed.count === 0) return null;

    return tx.user.create({
      data: {
        email: invite.email,
        handle: invite.handle,
        displayName,
        passwordHash: await hashPassword(plain),
        locale: resolved,
        // The first person through the door owns the place.
        role: (await tx.user.count()) === 0 ? 'OWNER' : 'MEMBER'
      }
    });
  });

  if (!user) return { error: 'badToken' };

  await createSession(user.id);
  await prisma.auditLog.create({
    data: { action: 'join_ok', userId: user.id, ipHash, userAgent }
  });

  redirect({ href: '/', locale: resolved });
  // `redirect` throws to unwind the request, so nothing below it runs. It is
  // typed as returning void rather than never, though, so the type checker
  // still wants an ending return; this is that and nothing more.
  return {};
}

export async function logout(locale: string): Promise<void> {
  const session = await readSession();
  if (session) {
    await prisma.auditLog.create({
      data: { action: 'logout', userId: session.userId }
    });
  }
  await destroySession();
  redirect({ href: '/login', locale: resolveLocale(locale) });
}
