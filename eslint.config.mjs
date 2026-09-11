import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

/**
 * The linter.
 *
 * There was a `lint` script here long before there was a linter: `next lint`
 * with nothing installed behind it, which does not fail — it stops and asks a
 * question, so in any script or agent it simply hangs. Worse than nothing,
 * because it reads as a check that passes.
 *
 * `next lint` is also on its way out in Next 16, so this is ESLint called
 * directly. `FlatCompat` is the bridge: `eslint-config-next` still ships the
 * old config format, and this wraps it for the flat config ESLint 9 expects.
 */

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    // Generated, vendored or built — nothing here was written by a person, and
    // a linter's opinion of it cannot be acted on.
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'src/generated/**',
      'prisma/generated/**'
    ]
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    rules: {
      /**
       * An unused variable is usually a leftover, but an unused *argument* is
       * often the shape of a signature someone else defined — the `_prev` that
       * every server action here takes and none of them read. Underscore means
       * "deliberately ignored", which is the convention this codebase already
       * follows.
       */
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none'
        }
      ]
    }
  }
];

export default config;
