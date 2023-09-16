import { PrismaClient } from '@prisma/client';
export const seedUsers = async (prisma: PrismaClient) => {
  await prisma.userSettings.upsert({
    where: { id: 'twenty-ge256b39-3ec3-4fe3-8997-9dcb1084c109' },
    update: {},
    create: {
      id: 'twenty-ge256b39-3ec3-4fe3-8997-9dcb1084c109',
      locale: 'en',
    },
  });
  await prisma.user.upsert({
    where: { id: 'twenty-ge256b39-3ec3-4fe3-8997-b76aa0bfc102' },
    update: {},
    create: {
      id: 'twenty-ge256b39-3ec3-4fe3-8997-b76aa0bfc102',
      firstName: 'Tim',
      lastName: 'Apple',
      email: 'tim@apple.dev',
      locale: 'en',
      passwordHash:
        '$2b$10$66d.6DuQExxnrfI9rMqOg.U1XIYpagr6Lv05uoWLYbYmtK0HDIvS6', // Applecar2025
      settingsId: 'twenty-ge256b39-3ec3-4fe3-8997-9dcb1084c109',
      avatarUrl: null,
      workspaceMember: {
        connectOrCreate: {
          where: {
            id: 'twenty-7ef9d213-1c25-4d02-bf35-6aeccf7ea419',
          },
          create: {
            workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
            settingsId: 'twenty-ge256b39-3ec3-4fe3-8997-9dcb1084c109',
          },
        },
      },
    },
  });

  await prisma.userSettings.upsert({
    where: { id: 'twenty-ge256b39-3ec3-4fe3-8997-2c4a2035a215' },
    update: {},
    create: {
      id: 'twenty-ge256b39-3ec3-4fe3-8997-2c4a2035a215',
      locale: 'en',
    },
  });
  await prisma.user.upsert({
    where: { id: 'twenty-ge256b39-3ec3-4fe3-8997-b76aa0bfa408' },
    update: {},
    create: {
      id: 'twenty-ge256b39-3ec3-4fe3-8997-b76aa0bfa408',
      firstName: 'Jony',
      lastName: 'Ive',
      email: 'jony.ive@apple.dev',
      locale: 'en',
      settingsId: 'twenty-ge256b39-3ec3-4fe3-8997-2c4a2035a215',
      avatarUrl: null,
      workspaceMember: {
        create: {
          id: 'twenty-7ef9d213-1c25-4d02-bf35-6aeccf7ea419',
          workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
          settingsId: 'twenty-ge256b39-3ec3-4fe3-8997-2c4a2035a215',
        },
      },
    },
  });

  await prisma.userSettings.upsert({
    where: { id: 'twenty-ge256b39-3ec3-4fe3-8997-8e1f2097b328' },
    update: {},
    create: {
      id: 'twenty-ge256b39-3ec3-4fe3-8997-8e1f2097b328',
      locale: 'en',
    },
  });
  await prisma.user.upsert({
    where: { id: 'twenty-gk256b39-3ec3-4fe3-8997-b76aa0bfa408' },
    update: {},
    create: {
      id: 'twenty-gk256b39-3ec3-4fe3-8997-b76aa0bfa408',
      firstName: 'Phil',
      lastName: 'Schiler',
      email: 'phil.schiler@apple.dev',
      locale: 'en',
      settingsId: 'twenty-ge256b39-3ec3-4fe3-8997-8e1f2097b328',
      avatarUrl: null,
      workspaceMember: {
        create: {
          id: 'twenty-7ed9d213-1c25-4d02-bf35-6aeccf7ea419',
          workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
          settingsId: 'twenty-ge256b39-3ec3-4fe3-8997-8e1f2097b328',
        },
      },
    },
  });

  await prisma.userSettings.upsert({
    where: { id: 'twenty-ge256b39-3ec3-4fe3-8997-5e2d1049c430' },
    update: {},
    create: {
      id: 'twenty-ge256b39-3ec3-4fe3-8997-5e2d1049c430',
      locale: 'en',
    },
  });
  await prisma.user.upsert({
    where: { id: 'twenty-dev-gk256b39-3ec3-4fe3-8997-b76aa0boa408' },
    update: {},
    create: {
      id: 'twenty-dev-gk256b39-3ec3-4fe3-8997-b76aa0boa408',
      firstName: 'Charles',
      lastName: 'Bochet',
      email: 'charles@twenty.dev',
      locale: 'en',
      settingsId: 'twenty-ge256b39-3ec3-4fe3-8997-5e2d1049c430',
      workspaceMember: {
        create: {
          id: 'twenty-dev-7ed9d213-1c25-4d02-bf35-6aeccf7oa419',
          workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
          settingsId: 'twenty-ge256b39-3ec3-4fe3-8997-5e2d1049c430',
        },
      },
    },
  });
};
