import { type QueryRunner } from 'typeorm';

import {
  type CreateWorkspaceInput,
  WORKSPACE_FIELDS_TO_SEED,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const tableName = 'workspace';

export type SeedWorkspaceArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  createWorkspaceInput: CreateWorkspaceInput;
};

export const createWorkspace = async ({
  schemaName,
  queryRunner,
  createWorkspaceInput,
}: SeedWorkspaceArgs) => {
  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, WORKSPACE_FIELDS_TO_SEED)
    .orIgnore()
    .values(createWorkspaceInput)
    .execute();
};

type DeleteWorkspacesArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const deleteWorkspaces = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: DeleteWorkspacesArgs) => {
  await queryRunner.manager
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`${tableName}."id" = :id`, { id: workspaceId })
    .execute();
};
