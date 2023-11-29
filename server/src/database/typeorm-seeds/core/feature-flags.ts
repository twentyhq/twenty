import { DataSource } from 'typeorm';

const tableName = 'featureFlag';

import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

export const seedFeatureFlags = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['key', 'workspaceId', 'value'])
    .orIgnore()
    .values([
      {
        key: 'feature1',
        workspaceId: SeedWorkspaceId,
        value: true,
      },
      {
        key: 'feature2',
        workspaceId: SeedWorkspaceId,
        value: false,
      },
    ])
    .execute();
};
