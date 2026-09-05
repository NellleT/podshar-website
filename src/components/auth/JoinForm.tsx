'use client';

import { useTranslations } from 'next-intl';

import { join, type AuthState } from '@/lib/auth/actions';
import { AuthForm, Field } from './AuthForm';

/**
 * The registration form.
 *
 * Email and handle are not asked for and not editable: they come from the
 * invite row, which is what makes the allowlist an allowlist. All the visitor
 * chooses is a display name and a password.
 *
 * The token arrives in the query string and rides along in a hidden field, so
 * that a page reload after a failed submit does not lose it.
 */
export function JoinForm({ locale, token }: { locale: string; token: string }) {
  const t = useTranslations('auth');
  const action = (prev: AuthState, formData: FormData) => join(locale, prev, formData);

  return (
    <AuthForm action={action} title={t('joinTitle')} hint={t('joinHint')} submitLabel={t('createAccount')}>
      <input type="hidden" name="token" value={token} />
      <Field name="displayName" label={t('displayName')} autoComplete="nickname" />
      <Field
        name="password"
        label={t('password')}
        type="password"
        autoComplete="new-password"
      />
      <Field
        name="confirm"
        label={t('confirmPassword')}
        type="password"
        autoComplete="new-password"
      />
    </AuthForm>
  );
}
