import { PrismaClient } from '@prisma/client';

export const SeedDataSourceId = '20202020-7f63-47a9-b1b3-6c7290ca9fb1';
export const SeedWorkspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
export const SeedWorkspaceSchemaName = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

export const seedMetadata = async (prisma: PrismaClient) => {
  await prisma.$queryRawUnsafe(
    `CREATE SCHEMA IF NOT EXISTS ${SeedWorkspaceSchemaName}`,
  );
  await prisma.$queryRawUnsafe(
    `INSERT INTO metadata."dataSource"(
      id, schema, type, "workspaceId"
    ) 
    VALUES (
      '${SeedDataSourceId}', '${SeedWorkspaceSchemaName}', 'postgres', '${SeedWorkspaceId}'
    ) ON CONFLICT DO NOTHING`,
  );
};
