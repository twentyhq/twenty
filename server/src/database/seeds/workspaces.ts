import { PrismaClient } from '@prisma/client'
export const seedWorkspaces = async (prisma: PrismaClient) => {
  await prisma.workspace.upsert({
    where: { domainName: 'twenty.com' },
    update: {},
    create: {
      id: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      displayName: 'Twenty',
      domainName: 'twenty.com',
    },
  })
  await prisma.workspace.upsert({
    where: { domainName: 'claap.com' },
    update: {},
    create: {
      id: '7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
      displayName: 'Claap',
      domainName: 'claap.com',
    },
  })
}
