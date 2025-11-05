import { type DataSource } from 'typeorm';

import {
  CreateWorkspaceInput,
  WORKSPACE_FIELDS_TO_SEED,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const tableName = 'workspace';

export type SeedWorkspaceArgs = {
  dataSource: DataSource;
  schemaName: string;
  createWorkspaceInput: CreateWorkspaceInput;
};

export const createWorkspace = async ({
  schemaName,
  dataSource,
  createWorkspaceInput,
}: SeedWorkspaceArgs) => {
  await dataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      ...WORKSPACE_FIELDS_TO_SEED,
      'version',
    ])
    .orIgnore()
    .values(createWorkspaceInput)
    .execute();
};

export const deleteWorkspaces = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`${tableName}."id" = :id`, { id: workspaceId })
    .execute();
};
