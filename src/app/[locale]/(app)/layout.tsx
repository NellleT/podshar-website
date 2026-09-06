import { redirect } from '@/i18n/routing';
import { AppShell } from '@/components/AppShell';
import { readSession } from '@/lib/auth/session';
import { guestModeAllowed } from '@/lib/auth/config';
import { getCurrentMember, getQuickStats } from '@/lib/session';
import { resolveLocale } from '@/lib/locale';

/**
 * The signed-in half of the site.
 *
 * Everything with a drawer, an assistant and a canvas lives under this layout,
 * and this is where access is actually decided. `middleware.ts` also redirects
 * a visitor with no cookie, but middleware runs in the Edge Runtime where
 * Prisma cannot load, so all it can check is that *a* cookie exists — it is a
 * shortcut that saves a render, not a gate.
 *
 * This is the gate: it asks the database whether the cookie names a live
 * session, and a forged or expired one gets no further than here.
 *
 * Guest mode — rendering this without a session — is a development-only
 * convenience for running before the database exists. In production a missing
 * `DATABASE_URL` shuts the door instead of opening it; see auth/config.ts.
 */
export default async function AppLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);

  if (!guestModeAllowed()) {
    const session = await readSession();
    if (!session) redirect({ href: '/login', locale });
  }

  const [profile, stats] = await Promise.all([getCurrentMember(), getQuickStats()]);

  return (
    <AppShell profile={profile} stats={stats}>
      {children}
    </AppShell>
  );
}
