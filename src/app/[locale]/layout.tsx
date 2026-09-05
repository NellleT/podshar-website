import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Manrope } from 'next/font/google';

import { routing } from '@/i18n/routing';
import { AppShell } from '@/components/AppShell';
import { getCurrentMember, getQuickStats } from '@/lib/session';
import { resolveLocale } from '@/lib/locale';
import '../globals.css';

/**
 * One family at every size in the app. Hierarchy comes from weight and
 * letter-spacing, never from a second face.
 *
 * Manrope, not Roboto: same neutral grotesque territory, but a taller x-height
 * and noticeably denser stems, so the same weight reads heavier. Roboto 400 was
 * going thin and grey against a near-white ground — this holds the page.
 *
 * The Cyrillic subset is not optional here: the greeting renders in Russian and
 * Ukrainian, and a fallback face mid-word would wreck the largest type on the
 * page. Four weights cover body (400), stats and the greeting (500), labels
 * (600) and the rare emphasis (700). Nothing lighter than 400 exists in the
 * system any more.
 */
const sans = Manrope({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
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
  themeColor: '#f2f2f2',
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
    <html lang={locale} className={sans.variable}>
      <body className="bg-canvas font-sans text-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* AppShell owns the drawer push and the canvas. */}
          <AppShell profile={profile} stats={stats}>
            {children}
          </AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
