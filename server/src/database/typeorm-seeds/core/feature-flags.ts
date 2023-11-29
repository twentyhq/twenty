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
        key: 'IS_RELATION_FIELD_TYPE_ENABLED',
        workspaceId: SeedWorkspaceId,
        value: true,
      },
    ])
    .execute();
};
