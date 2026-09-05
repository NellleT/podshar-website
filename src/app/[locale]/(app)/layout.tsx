import { redirect } from '@/i18n/routing';
import { AppShell } from '@/components/AppShell';
import { readSession } from '@/lib/auth/session';
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
 * While `DATABASE_URL` is unset there is nothing to ask, so the site stays
 * open in guest mode rather than locking everyone out of a database that does
 * not exist yet.
 */
export default async function AppLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);

  if (process.env.DATABASE_URL) {
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
