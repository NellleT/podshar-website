import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Roboto } from 'next/font/google';

import { routing } from '@/i18n/routing';
import { AppShell } from '@/components/AppShell';
import { getCurrentMember, getQuickStats } from '@/lib/session';
import { resolveLocale } from '@/lib/locale';
import '../globals.css';

/**
 * One family, Roboto, at every size in the app. Hierarchy comes from weight and
 * letter-spacing, never from a second face.
 *
 * The Cyrillic subset is not optional here: the greeting renders in Russian and
 * Ukrainian, and a fallback face mid-word would wreck the largest type on the
 * page. Four weights cover labels (500), body (400), and the thin greeting (300).
 */
const roboto = Roboto({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap'
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // Guarded too: metadata runs for unmatched paths as well, and loading a
  // catalogue for a locale that does not exist fails the whole request.
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: { default: t('title'), template: `%s — ${t('title')}` },
    description: t('description'),
    manifest: '/manifest.webmanifest',
    applicationName: 'Podshar',
    appleWebApp: { capable: true, title: 'Podshar', statusBarStyle: 'default' },
    // A private hub for three people has no business in a search index.
    robots: { index: false, follow: false, nocache: true }
  };
}

export const viewport: Viewport = {
  themeColor: '#f7efe5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Validates the segment and opts this subtree into static rendering.
  const locale = resolveLocale((await params).locale);

  const [messages, profile, stats] = await Promise.all([
    getMessages(),
    getCurrentMember(),
    getQuickStats()
  ]);

  return (
    <html lang={locale} className={roboto.variable}>
      <body className="bg-canvas font-sans text-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* AppShell owns the three-column grid and the drawer push. */}
          <AppShell profile={profile} stats={stats}>
            {children}
          </AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
