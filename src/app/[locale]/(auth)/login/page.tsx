import { getTranslations } from 'next-intl/server';

import { LoginForm } from '@/components/auth/LoginForm';
import { Link } from '@/i18n/routing';
import { mailConfigured } from '@/lib/mail';
import { resolveLocale } from '@/lib/locale';

/**
 * Rendered per request rather than prerendered.
 *
 * The only dynamic thing here is whether mail is configured, and that is read
 * from the environment — which a static build would resolve once, at build
 * time, and bake in. Adding `RESEND_API_KEY` on the host afterwards would then
 * change nothing until someone happened to redeploy, and the obvious reading of
 * that is "the key is wrong", which is the one thing it is not.
 *
 * The cost is a server render of a login form for three people.
 */
export const dynamic = 'force-dynamic';

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
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="flex flex-col gap-5">
      <LoginForm locale={locale} />

      {/* Only offered when there is a mail provider to carry the letter. A
          "forgot password?" link that leads to a form, takes an address and
          then does nothing is worse than no link at all — it costs somebody
          their evening waiting for a letter nobody could have sent. */}
      {mailConfigured() ? (
        <Link
          href="/reset"
          className="text-sm text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
        >
          {t('forgot')}
        </Link>
      ) : null}
    </div>
  );
}
