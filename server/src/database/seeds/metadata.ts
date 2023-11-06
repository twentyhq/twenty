import { PrismaClient } from '@prisma/client';

export const seedMetadata = async (prisma: PrismaClient) => {
  await prisma.$queryRawUnsafe(
    'CREATE SCHEMA IF NOT EXISTS workspace_twenty_7icsva0r6s00mpcp6cwg4w4rd',
  );
  await prisma.$queryRawUnsafe(
    `INSERT INTO metadata.data_source_metadata(
      id, schema, type, workspace_id
    ) 
    VALUES (
      'b37b2163-7f63-47a9-b1b3-6c7290ca9fb1', 'workspace_twenty_7icsva0r6s00mpcp6cwg4w4rd', 'postgres', 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419'
    ) ON CONFLICT DO NOTHING`,
  );
};
