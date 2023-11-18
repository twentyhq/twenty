import { DataSource } from 'typeorm';

import { seedUsers } from 'src/database/typeorm-seeds/core/users';
import { seedWorkspaces } from 'src/database/typeorm-seeds/core/workspaces';

export const seedCoreSchema = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await seedUsers(workspaceDataSource, schemaName);
  await seedWorkspaces(workspaceDataSource, schemaName);
};
