import { DataSource } from 'typeorm';

// import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

// export const SeedWorkspaceSchemaName = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const tableName = 'dataSource';

// export const SeedDataSourceId = '20202020-7f63-47a9-b1b3-6c7290ca9fb1';

export const seedDataSource = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
  dataSourceId: string,
  workspaceSchemaName: string,
) => {
  await workspaceDataSource.query(
    `CREATE SCHEMA IF NOT EXISTS ${workspaceSchemaName}`,
  );

  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['id', 'schema', 'type', 'workspaceId'])
    .orIgnore()
    .values([
      {
        id: dataSourceId,
        schema: workspaceSchemaName,
        type: 'postgres',
        workspaceId: workspaceId,
      },
    ])
    .execute();
};
