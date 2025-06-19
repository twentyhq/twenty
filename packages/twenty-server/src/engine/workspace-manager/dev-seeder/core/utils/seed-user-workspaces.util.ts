import { DataSource } from 'typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

const tableName = 'userWorkspace';

export const USER_WORKSPACE_DATA_SEED_IDS = {
  TIM: '20202020-9e3b-46d4-a556-88b9ddc2b035',
  JONY: '20202020-3957-4908-9c36-2929a23f8353',
  PHIL: '20202020-7169-42cf-bc47-1cfef15264b1',
  TIM_ACME: '20202020-e10a-4c27-a90b-b08c57b02d44',
  JONY_ACME: '20202020-e10a-4c27-a90b-b08c57b02d45',
  PHIL_ACME: '20202020-e10a-4c27-a90b-b08c57b02d46',
};

export const seedUserWorkspaces = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  let userWorkspaces: Pick<UserWorkspace, 'id' | 'userId' | 'workspaceId'>[] =
    [];

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    userWorkspaces = [
      {
        id: USER_WORKSPACE_DATA_SEED_IDS.TIM,
        userId: USER_DATA_SEED_IDS.TIM,
        workspaceId,
      },
      {
        id: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        userId: USER_DATA_SEED_IDS.JONY,
        workspaceId,
      },
      {
        id: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
        userId: USER_DATA_SEED_IDS.PHIL,
        workspaceId,
      },
    ];
  }

  if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
    userWorkspaces = [
      {
        id: USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME,
        userId: USER_DATA_SEED_IDS.TIM,
        workspaceId,
      },
      {
        id: USER_WORKSPACE_DATA_SEED_IDS.JONY_ACME,
        userId: USER_DATA_SEED_IDS.JONY,
        workspaceId,
      },
      {
        id: USER_WORKSPACE_DATA_SEED_IDS.PHIL_ACME,
        userId: USER_DATA_SEED_IDS.PHIL,
        workspaceId,
      },
    ];
  }
  await dataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['id', 'userId', 'workspaceId'])
    .orIgnore()
    .values(userWorkspaces)
    .execute();
};

export const deleteUserWorkspaces = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`"${tableName}"."workspaceId" = :workspaceId`, {
      workspaceId,
    })
    .execute();
};
