// check-db.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result =
    await prisma.$queryRaw`SELECT 1 FROM pg_tables WHERE tablename='_prisma_migrations';`;
  console.log(result);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
