import { getTranslations } from 'next-intl/server';

import { JoinForm } from '@/components/auth/JoinForm';
import { resolveLocale } from '@/lib/locale';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('joinTitle') };
}

export default async function JoinPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const { token } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'auth' });

  // No token, no form. The invite is the entire allowlist, so a bare /join is
  // a dead end by design rather than an oversight — and saying so beats
  // rendering fields that cannot possibly submit.
  if (!token) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold leading-tight text-ink">{t('joinTitle')}</h1>
        <p className="text-sm leading-relaxed text-ink-muted">{t('noToken')}</p>
      </div>
    );
  }

  return <JoinForm locale={locale} token={token} />;
}
