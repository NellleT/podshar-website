import { getTranslations } from 'next-intl/server';

import { ResetPasswordForm, ResetRequestForm } from '@/components/auth/ResetForms';
import { mailConfigured } from '@/lib/mail';
import { resolveLocale } from '@/lib/locale';

/** Per request, for the same reason as the login page: whether mail works is
 *  read from the environment, and a prerendered answer would be stale the
 *  moment a key is added on the host. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'reset' });
  return { title: t('title') };
}

/**
 * One route, two states.
 *
 * With a token in the query string this is the second half of a reset — the
 * letter has been opened and a new password is being chosen. Without one it is
 * the first half, the box you type your address into. Same shape as `/join`,
 * which also decides what it is by whether a token came with it.
 */
export default async function ResetPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const { token } = await searchParams;

  if (token) return <ResetPasswordForm locale={locale} token={token} />;

  // No mail provider, no letters. Saying so is better than accepting an address
  // and answering "check your inbox" for a letter that was never going to be
  // sent — and it gives away nothing, because it is a fact about the site
  // rather than about whoever is asking.
  //
  // The half above stays reachable regardless: a link issued while mail worked
  // must keep working if the key is later rotated out.
  if (!mailConfigured()) {
    const t = await getTranslations({ locale, namespace: 'reset' });
    return (
      <div className="flex w-full max-w-sm flex-col gap-3">
        <h1 className="text-2xl font-semibold leading-tight text-ink">{t('title')}</h1>
        <p className="text-sm leading-relaxed text-ink-muted">{t('noMail')}</p>
      </div>
    );
  }

  return <ResetRequestForm locale={locale} />;
}
