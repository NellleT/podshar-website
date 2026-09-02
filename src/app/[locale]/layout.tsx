import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Playfair_Display, Inter } from 'next/font/google';

import { routing, type Locale } from '@/i18n/routing';
import { AppShell } from '@/components/AppShell';
import { getCurrentMember, getQuickStats } from '@/lib/session';
import '../globals.css';

/**
 * Playfair carries the greeting and every display line; Inter carries the UI.
 *
 * Both faces ship Cyrillic, which is not optional here: the greeting renders in
 * Russian and Ukrainian, and a fallback face mid-word would wreck the one piece
 * of typography the homepage is built around.
 */
const display = Playfair_Display({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-display',
  display: 'swap'
});

const sans = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
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
  const { locale } = await params;
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
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  // Opts this subtree into static rendering instead of forcing it dynamic.
  setRequestLocale(locale);

  const [messages, profile, stats] = await Promise.all([
    getMessages(),
    getCurrentMember(),
    getQuickStats()
  ]);

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
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
