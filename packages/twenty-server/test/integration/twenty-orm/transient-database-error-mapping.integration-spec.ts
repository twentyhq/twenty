import { FeatureFlagKey } from 'twenty-shared/types';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/global-workspace-datasource/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const TRANSIENT_DATABASE_ERROR = 'TRANSIENT_DATABASE_ERROR';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const raiseSqlState = (sqlState: string): string =>
  `DO $$ BEGIN RAISE EXCEPTION 'simulated database failure' USING ERRCODE = '${sqlState}'; END $$;`;

const useOrmV2ReadPath = (value: boolean): Promise<void> =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
    value,
    expectToFail: false,
  });

const runInTransaction = (
  work: (transactionScope: WorkspaceTransactionScope) => Promise<unknown>,
): Promise<unknown> => {
  const globalWorkspaceOrmManager =
    getAppProviderByClassName<GlobalWorkspaceOrmManager>(
      'GlobalWorkspaceOrmManager',
    );

  return globalWorkspaceOrmManager.executeInWorkspaceContext(
    async () => globalWorkspaceOrmManager.runInWorkspaceTransaction(work),
    authContext,
    { lite: true },
  );
};

const runInTransactionRaising = (sqlState: string): Promise<unknown> =>
  runInTransaction(async (transactionScope) => {
    await transactionScope.executeRawQuery(raiseSqlState(sqlState));
  });

const expectTransientMappingContract = (): void => {
  it('should mark the idle-in-transaction timeout that kills long imports as transient', async () => {
    await expect(
      runInTransactionRaising(
        POSTGRESQL_ERROR_CODES.IDLE_IN_TRANSACTION_SESSION_TIMEOUT,
      ),
    ).rejects.toMatchObject({ code: TRANSIENT_DATABASE_ERROR });
  }, 60000);

  it('should leave a unique violation alone so a real conflict is not retried', async () => {
    await expect(
      runInTransactionRaising(POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION),
    ).rejects.not.toMatchObject({ code: TRANSIENT_DATABASE_ERROR });
  }, 60000);
};

describe('Transient database error mapping on the ORM v1 path', () => {
  beforeAll(async () => {
    await useOrmV2ReadPath(false);
  }, 60000);

  afterAll(async () => {
    await useOrmV2ReadPath(true);
  }, 60000);

  expectTransientMappingContract();

  it('should report the failure that killed the connection rather than the rollback that fails after it', async () => {
    await expect(
      runInTransaction(async (transactionScope) => {
        await transactionScope.executeRawQuery(
          'SELECT pg_terminate_backend(pg_backend_pid())',
        );
      }),
    ).rejects.toMatchObject({ code: TRANSIENT_DATABASE_ERROR });
  }, 60000);
});

describe('Transient database error mapping on the ORM v2 path', () => {
  beforeAll(async () => {
    await useOrmV2ReadPath(true);
  }, 60000);

  expectTransientMappingContract();
});
