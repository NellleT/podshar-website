import { getTranslations } from 'next-intl/server';

import { LoginForm } from '@/components/auth/LoginForm';
import { resolveLocale } from '@/lib/locale';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('loginTitle') };
}

export default async function LoginPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  // The locale is handed to the form so it can bind it to the server action:
  // actions get no route params, and the post-login redirect has to land on
  // the language the visitor was already reading.
  const locale = resolveLocale((await params).locale);
  return <LoginForm locale={locale} />;
}
