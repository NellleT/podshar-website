'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';

import type { AuthState } from '@/lib/auth/actions';

/**
 * The shell both auth forms sit in.
 *
 * The server action returns a translation key, never a sentence — the server
 * has no business knowing which of the four languages is on screen. This
 * resolves the key against the `auth.errors` namespace, and falls back to the
 * generic message if a key ever arrives that the catalogue does not carry.
 */
export function AuthForm({
  action,
  title,
  hint,
  submitLabel,
  children
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  title: string;
  hint?: string;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const t = useTranslations('auth');
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  const message = state.error
    ? t.has(`errors.${state.error}`)
      ? t(`errors.${state.error}`)
      : t('errors.invalid')
    : null;

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold leading-tight text-ink">{title}</h1>
        {hint ? <p className="text-sm leading-relaxed text-ink-muted">{hint}</p> : null}
      </div>

      {children}

      {message ? (
        // `role="alert"` so a screen reader announces the failure instead of
        // leaving the visitor to wonder why the form did nothing.
        <p
          role="alert"
          className="rounded border-2 border-reactor/40 bg-reactor/10 px-3 py-2.5 text-sm text-ink"
        >
          {message}
        </p>
      ) : null}

      <Submit label={submitLabel} />
    </form>
  );
}

/** Its own component because `useFormStatus` only reports for the form above
 *  it — read in the parent it would always come back idle. */
function Submit({ label }: { label: string }) {
  const t = useTranslations('auth');
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border-2 border-transparent bg-accent px-4 py-3 text-sm font-semibold text-accent-ink transition-opacity duration-drape hover:opacity-85 disabled:opacity-40"
    >
      {pending ? t('working') : label}
    </button>
  );
}

/** One labelled input. Kept here so both forms space and style identically. */
export function Field({
  name,
  label,
  type = 'text',
  autoComplete,
  defaultValue,
  required = true,
  readOnly = false
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="ps-label">{label}</span>
      {/* 16px on a phone, 15 from `sm` up. Below 16, Safari on an iPhone zooms
          the whole page in the moment the field is tapped and leaves it zoomed
          — after which the page can be dragged sideways. */}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        readOnly={readOnly}
        className="rounded border-2 border-rule bg-canvas px-3 py-2.5 text-[1rem] text-ink outline-none transition-colors focus:border-ink read-only:text-ink-muted placeholder:text-ink-faint sm:text-[0.9375rem]"
      />
    </label>
  );
}
