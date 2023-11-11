import { PrismaClient } from '@prisma/client';

export const SeedDataSourceId = '20202020-7f63-47a9-b1b3-6c7290ca9fb1';
export const SeedWorkspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
export const SeedWorkspaceSchemaName =
  'workspace_twenty_7icsva0r6s00mpcp6cwg4w4rd';

export const seedMetadata = async (prisma: PrismaClient) => {
  await prisma.$queryRawUnsafe(
    `CREATE SCHEMA IF NOT EXISTS ${SeedWorkspaceSchemaName}`,
  );
  await prisma.$queryRawUnsafe(
    `INSERT INTO metadata."dataSource"(
      id, schema, type, "workspaceId"
    ) 
    VALUES (
      '${SeedDataSourceId}', '${SeedWorkspaceId}', 'postgres', '${SeedWorkspaceSchemaName}'
    ) ON CONFLICT DO NOTHING`,
  );
};
