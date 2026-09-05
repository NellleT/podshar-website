import 'server-only';

import { hash, verify } from '@node-rs/argon2';

/**
 * Password hashing.
 *
 * Argon2id, which is what you use unless you have a specific reason not to: it
 * resists both GPU cracking (memory-hard) and side-channel attacks (the `id`
 * variant), and it is the only algorithm OWASP recommends without caveats.
 *
 * The parameters below are OWASP's baseline — 19 MiB of memory, two passes,
 * one lane. They cost roughly 50 ms per hash on this machine, which is
 * irrelevant for three people logging in and expensive for anyone working
 * through a stolen database.
 *
 * `@node-rs/argon2` rather than the `argon2` package: it ships prebuilt
 * binaries, so nobody has to have a C toolchain installed to run the project.
 * The salt is generated per hash and stored inside the returned string, so
 * there is nothing else to keep.
 */
const PARAMS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, PARAMS);
}

/**
 * Check a password against a stored hash.
 *
 * Returns false rather than throwing on a malformed hash: a corrupted row
 * should read as "wrong password" at the login form, not as a 500 that tells
 * the visitor something about the state of the database.
 */
export async function verifyPassword(storedHash: string, plain: string): Promise<boolean> {
  try {
    return await verify(storedHash, plain);
  } catch {
    return false;
  }
}
