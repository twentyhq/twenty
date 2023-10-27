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

  await prisma.$queryRawUnsafe(`CREATE TABLE IF NOT EXISTS 
    workspace_twenty_7icsva0r6s00mpcp6cwg4w4rd.company(
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "deletedAt" TIMESTAMP WITH TIME ZONE,
      domainName TEXT NOT NULL,
      address TEXT NOT NULL,
      employees INTEGER NOT NULL
    );
  `);
  await prisma.$queryRawUnsafe(`INSERT INTO workspace_twenty_7icsva0r6s00mpcp6cwg4w4rd.company(
    id, name, domainName, address, employees
  )
  VALUES (
    '89bb825c-171e-4bcc-9cf7-43448d6fb278', 'Airbnb', 'airbnb.com', 'San Francisco', 5000
  ), (
    '04b2e9f5-0713-40a5-8216-82802401d33e', 'Qonto', 'qonto.com', 'San Francisco', 800
  ), (
    '118995f3-5d81-46d6-bf83-f7fd33ea6102', 'Facebook', 'facebook.com', 'San Francisco', 8000
  ), (
    '460b6fb1-ed89-413a-b31a-962986e67bb4', 'Microsoft', 'microsoft.com', 'San Francisco', 800
  ), (
    'fe256b39-3ec3-4fe3-8997-b76aa0bfa408', 'Linkedin', 'linkedin.com', 'San Francisco', 400
  ) ON CONFLICT DO NOTHING`);

  await prisma.$queryRawUnsafe(`INSERT INTO metadata.object_metadata(
    id, name_singular, name_plural, label_singular, label_plural, description, icon, target_table_name, is_custom, is_active, workspace_id, data_source_id
  )
  VALUES (
    'ba391617-ee08-432f-9438-2e17df5ac279', 'companyV2', 'companiesV2', 'Company', 'Companies', 'Companies', 'company', 'company', false, true, 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419', 'b37b2163-7f63-47a9-b1b3-6c7290ca9fb1'
  ) ON CONFLICT DO NOTHING`);

  await prisma.$queryRawUnsafe(`INSERT INTO metadata.field_metadata(
    id, object_id, type, name, label, target_column_map, description, icon, enums, is_custom, is_active, is_nullable, workspace_id
  )
  VALUES (
    '22f5906d-153f-448c-b254-28adce721dcd', 'ba391617-ee08-432f-9438-2e17df5ac279', 'text', 'name', 'Name', '{"value": "name"}', 'Name', 'user', NULL, false, true, false, 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419'
  ), (
    '19bfab29-1cbb-4ce2-9117-8540ac45a0f1', 'ba391617-ee08-432f-9438-2e17df5ac279', 'text', 'domainName', 'Domain Name', '{"value": "domainName"}', 'Domain Name', 'link', NULL, false, true, true, 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419'
  ), (
    '70130f27-9497-4b44-a04c-1a0fb9a4829c', 'ba391617-ee08-432f-9438-2e17df5ac279', 'text', 'address', 'Address', '{"value": "address"}', 'Address', 'location', NULL, false, true, true, 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419'
  ), (
    '2a63c30e-8e80-475b-b5d7-9dda17adc537', 'ba391617-ee08-432f-9438-2e17df5ac279', 'number', 'employees', 'Employees', '{"value": "employees"}', 'Employees', 'people', NULL, false, true, true, 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419'
  ) ON CONFLICT DO NOTHING`);
};
