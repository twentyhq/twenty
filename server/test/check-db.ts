// check-db.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const schemaDatabaseExists = async (databaseName: string) => {
  try {
    const result = await prisma.$queryRawUnsafe<[any]>(
      `SELECT 1 FROM pg_database WHERE datname = '${databaseName}';`,
    );

    return result.length > 0;
  } catch {
    return false;
  }
};

async function main() {
  const databaseName = 'tests';
  // Check if schema exists
  const databaseExistsResult = await schemaDatabaseExists(databaseName);

  if (!databaseExistsResult) {
    throw new Error(`Schema ${databaseName} does not exist`);
  }

  // Check if database is initialized
  await prisma.$queryRaw`SELECT 1 FROM pg_tables WHERE tablename='_prisma_migrations';`;
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
