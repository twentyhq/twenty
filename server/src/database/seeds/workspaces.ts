import { PrismaClient } from '@prisma/client';
export const seedWorkspaces = async (prisma: PrismaClient) => {
  await prisma.workspace.upsert({
    where: { id: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419' },
    update: {},
    create: {
      id: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      displayName: 'Apple',
      domainName: 'apple.dev',
      logo: null,
    },
  });

  await prisma.workspace.upsert({
    where: { id: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420' },
    update: {},
    create: {
      id: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
      displayName: 'Twenty',
      domainName: 'twenty.com',
      logo: null,
    },
  });
};
