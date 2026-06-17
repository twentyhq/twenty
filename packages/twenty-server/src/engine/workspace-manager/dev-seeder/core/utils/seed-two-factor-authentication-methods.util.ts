import { type QueryRunner } from 'typeorm';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const tableName = 'twoFactorAuthenticationMethod';

export const TWO_FACTOR_AUTHENTICATION_METHOD_DATA_SEED_IDS = {
  JANE: '20202020-1111-4a01-8001-000000000004',
};

type SeedTwoFactorAuthenticationMethodsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

// Seeds a verified TOTP method for Jane so the server-level impersonation flow
// (which requires verified 2FA outside development) can be tested end to end.
// Gated to the test environment and Apple workspace: the secret is a dummy
// enc:v2 placeholder (only its VERIFIED status is read by the impersonation
// check) and would otherwise make Jane unable to complete a real 2FA login in
// the dev/demo workspace.
export const seedTwoFactorAuthenticationMethods = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedTwoFactorAuthenticationMethodsArgs) => {
  if (
    process.env.NODE_ENV !== 'test' ||
    workspaceId !== SEED_APPLE_WORKSPACE_ID
  ) {
    return;
  }

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'workspaceId',
      'userWorkspaceId',
      'secret',
      'status',
      'strategy',
    ])
    .orIgnore()
    .values([
      {
        id: TWO_FACTOR_AUTHENTICATION_METHOD_DATA_SEED_IDS.JANE,
        workspaceId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        secret: 'enc:v2:seed-totp-secret-test-fixture',
        status: 'VERIFIED',
        strategy: 'TOTP',
      },
    ])
    .execute();
};
