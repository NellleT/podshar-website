import 'server-only';

import { PrismaClient } from '@prisma/client';

/**
 * The Prisma client, as a singleton.
 *
 * In development Next.js reloads modules on every edit while the Node process
 * survives, so a plain `new PrismaClient()` at module scope leaks a connection
 * pool per reload and eventually exhausts Postgres' connection limit. Stashing
 * it on `globalThis` — which module reloading does not clear — is the standard
 * way out, and it is a no-op in production where modules load once.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Queries only in dev; errors always. A private site for three has no use
    // for query logs in production, and they would leak handles into stdout.
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
