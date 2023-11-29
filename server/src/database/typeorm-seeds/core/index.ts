import { DataSource } from 'typeorm';

import { seedUsers } from 'src/database/typeorm-seeds/core/users';
import { seedWorkspaces } from 'src/database/typeorm-seeds/core/workspaces';

export const seedCoreSchema = async (
  workspaceDataSource: DataSource,
  workspaceId: string,
) => {
  const schemaName = 'core';
  await seedWorkspaces(workspaceDataSource, schemaName, workspaceId);
  await seedUsers(workspaceDataSource, schemaName, workspaceId);
};
