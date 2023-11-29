import { DataSource } from 'typeorm';

import { seedUsers } from 'src/database/typeorm-seeds/core/users';
import { seedWorkspaces } from 'src/database/typeorm-seeds/core/workspaces';
import { seedFeatureFlags } from 'src/database/typeorm-seeds/core/feature-flags';

export const seedCoreSchema = async (workspaceDataSource: DataSource) => {
  const schemaName = 'core';
  await seedWorkspaces(workspaceDataSource, schemaName);
  await seedUsers(workspaceDataSource, schemaName);
  await seedFeatureFlags(workspaceDataSource, schemaName);
};
