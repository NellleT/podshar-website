import { randomBytes, createHash } from 'node:crypto';
import { PrismaClient, PoiKind } from '@prisma/client';

const prisma = new PrismaClient();

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/**
 * Seeds the fixed world: the three invites that constitute the entire
 * allowlist, our home locations, the POIs we actually check transit to, and
 * the Doomsday countdown.
 *
 * Invite tokens are printed once, here, and only the hash is stored. Hand each
 * person their token out of band; registration accepts nothing else.
 */
async function main() {
  const invitees = [
    { email: 'one@podshar.local', handle: 'one' },
    { email: 'two@podshar.local', handle: 'two' },
    { email: 'three@podshar.local', handle: 'three' }
  ];

  for (const invitee of invitees) {
    const token = randomBytes(24).toString('base64url');
    await prisma.invite.upsert({
      where: { email: invitee.email },
      update: {},
      create: {
        ...invitee,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    });
    console.log(`invite ${invitee.handle}: ${token}`);
  }

  await prisma.countdown.upsert({
    where: { key: 'doomsday' },
    update: {},
    create: {
      key: 'doomsday',
      label: 'Doomsday',
      targetAt: new Date('2030-01-01T00:00:00Z')
    }
  });

  const home = await prisma.location.create({
    data: { label: 'Home', latitude: 47.3769, longitude: 8.5417, stopId: '8503000' }
  });

  await prisma.pointOfInterest.createMany({
    data: [
      { label: 'IKEA', kind: PoiKind.IKEA, latitude: 47.4, longitude: 8.5 },
      { label: 'Swisscom Shop', kind: PoiKind.SWISSCOM, latitude: 47.377, longitude: 8.539 }
    ],
    skipDuplicates: true
  });

  console.log(`seeded home location ${home.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
