import { PrismaClient } from '@prisma/client';
export const seedUsers = async (prisma: PrismaClient) => {
  await prisma.user.upsert({
    where: { id: 'twenty-ge256b39-3ec3-4fe3-8997-b76aa0bfa408' },
    update: {},
    create: {
      id: 'twenty-ge256b39-3ec3-4fe3-8997-b76aa0bfa408',
      displayName: 'Charles Bochet',
      email: 'charles@test.com',
      locale: 'en',
      workspaceMember: {
        create: {
          id: 'twenty-7ef9d213-1c25-4d02-bf35-6aeccf7ea419',
          workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { id: 'twenty-gk256b39-3ec3-4fe3-8997-b76aa0bfa408' },
    update: {},
    create: {
      id: 'twenty-gk256b39-3ec3-4fe3-8997-b76aa0bfa408',
      displayName: 'Félix Malfait',
      email: 'felix@test.com',
      locale: 'en',
      workspaceMember: {
        create: {
          id: 'twenty-7ed9d213-1c25-4d02-bf35-6aeccf7ea419',
          workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { id: 'twenty-dev-gk256b39-3ec3-4fe3-8997-b76aa0boa408' },
    update: {},
    create: {
      id: 'twenty-dev-gk256b39-3ec3-4fe3-8997-b76aa0boa408',
      displayName: 'Charles Bochet Dev',
      email: 'charles-dev@test.com',
      locale: 'en',
      workspaceMember: {
        create: {
          id: 'twenty-dev-7ed9d213-1c25-4d02-bf35-6aeccf7oa419',
          workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
        },
      },
    },
  });
};
