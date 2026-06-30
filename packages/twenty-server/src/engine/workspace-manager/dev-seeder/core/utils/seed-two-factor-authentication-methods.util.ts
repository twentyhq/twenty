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
  // Real enc:v2 envelope encrypted for this workspace so the value survives the
  // secret-encryption rotation command (which decrypts/re-encrypts every
  // `totp-secret` row); a malformed placeholder would break that rotation.
  encryptedSecret: string;
};

// Seeds a verified TOTP method for Jane so the server-level impersonation flow
// (which requires verified 2FA outside development) can be tested end to end.
// Gated to the test environment and Apple workspace: only the VERIFIED status
// is read by the impersonation check, and seeding it in the dev/demo workspace
// would otherwise make Jane unable to complete a real 2FA login.
export const seedTwoFactorAuthenticationMethods = async ({
  queryRunner,
  schemaName,
  workspaceId,
  encryptedSecret,
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
        secret: encryptedSecret,
        status: 'VERIFIED',
        strategy: 'TOTP',
      },
    ])
    .execute();
};
