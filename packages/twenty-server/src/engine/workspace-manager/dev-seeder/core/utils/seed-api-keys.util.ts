import { DataSource } from 'typeorm';

const tableName = 'apiKey';

export const seedApiKeys = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'expiresAt',
      'workspaceId',
    ])
    .orIgnore()
    .values([
      {
        id: '20202020-f401-4d8a-a731-64d007c27bad',
        name: 'My api key',
        expiresAt: '2025-12-31T23:59:59.000Z',
        workspaceId: workspaceId,
      },
    ])
    .execute();
};
