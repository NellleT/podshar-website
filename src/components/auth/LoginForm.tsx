'use client';

import { useTranslations } from 'next-intl';

import { login, type AuthState } from '@/lib/auth/actions';
import { AuthForm, Field } from './AuthForm';

/**
 * The login form.
 *
 * The locale is bound to the action here rather than read on the server:
 * server actions have no route params, and after a successful login the
 * redirect has to land on the language the visitor was already reading.
 */
export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('auth');
  const action = (prev: AuthState, formData: FormData) => login(locale, prev, formData);

  return (
    <AuthForm action={action} title={t('loginTitle')} hint={t('loginHint')} submitLabel={t('signIn')}>
      <Field
        name="identifier"
        label={t('identifier')}
        autoComplete="username"
        // One field for handle or email: with three accounts nobody remembers
        // which of the two they registered with.
      />
      <Field
        name="password"
        label={t('password')}
        type="password"
        autoComplete="current-password"
      />
    </AuthForm>
  );
}
