// check-db.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createMetadataSchema = async () => {
  try {
    await prisma.$queryRawUnsafe<[any]>(
      `CREATE SCHEMA IF NOT EXISTS "metadata";`,
    );
    await prisma.$queryRawUnsafe<[any]>(
      `GRANT ALL ON SCHEMA metadata TO twenty;`,
    );

    return true;
  } catch {
    return false;
  }
};

const activateUUIDExtension = async () => {
  try {
    const result = await prisma.$queryRawUnsafe<[any]>(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
    );

    return result;
  } catch {
    return false;
  }
};

const main = async () => {
  const metadataSchemaCreationSuccess = await createMetadataSchema();
  const uuidExtensionActivationSuccess = await activateUUIDExtension();

  if (!metadataSchemaCreationSuccess) {
    throw new Error(`Failed to create metadata schema`);
  }

  if (!uuidExtensionActivationSuccess) {
    throw new Error(`Failed to activate uuid extension`);
  }
};

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
