import { DataSource } from 'typeorm';

import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';

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
        id: API_KEY_DATA_SEED_IDS.ID_1,
        name: 'My api key',
        expiresAt: '2025-12-31T23:59:59.000Z',
        workspaceId: workspaceId,
      },
    ])
    .execute();
};
