import { FeatureFlagKey } from 'twenty-shared/types';

import { TRANSIENT_POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/transient-postgres-error-codes.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const TRANSIENT_DATABASE_ERROR = 'TRANSIENT_DATABASE_ERROR';
const UNIQUE_VIOLATION = '23505';

const raiseSqlState = (sqlState: string): string =>
  `DO $$ BEGIN RAISE EXCEPTION 'simulated database failure' USING ERRCODE = '${sqlState}'; END $$;`;

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const getGlobalWorkspaceOrmManager = (): GlobalWorkspaceOrmManager =>
  getAppProviderByClassName<GlobalWorkspaceOrmManager>(
    'GlobalWorkspaceOrmManager',
  );

const runTransaction = (work: () => Promise<unknown>): Promise<unknown> => {
  const globalWorkspaceOrmManager = getGlobalWorkspaceOrmManager();

  return globalWorkspaceOrmManager.executeInWorkspaceContext(
    async () => globalWorkspaceOrmManager.runInWorkspaceTransaction(work),
    authContext,
    { lite: true },
  );
};

const runTransactionRaising = (sqlState: string): Promise<unknown> => {
  const globalWorkspaceOrmManager = getGlobalWorkspaceOrmManager();

  return globalWorkspaceOrmManager.executeInWorkspaceContext(
    async () =>
      globalWorkspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          await transactionScope.executeRawQuery(raiseSqlState(sqlState));
        },
      ),
    authContext,
    { lite: true },
  );
};

const setOrmV2ReadPath = (value: boolean): Promise<void> =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
    value,
    expectToFail: false,
  });

describe('Transient database error mapping on the ORM v2 path', () => {
  beforeAll(async () => {
    await setOrmV2ReadPath(true);
  }, 60000);

  it.each(TRANSIENT_POSTGRESQL_ERROR_CODES)(
    'should map sqlstate %s to a transient database error',
    async (sqlState) => {
      await expect(runTransactionRaising(sqlState)).rejects.toMatchObject({
        code: TRANSIENT_DATABASE_ERROR,
      });
    },
    60000,
  );

  it('should not map a unique violation to a transient database error', async () => {
    await expect(
      runTransactionRaising(UNIQUE_VIOLATION),
    ).rejects.not.toMatchObject({ code: TRANSIENT_DATABASE_ERROR });
  }, 60000);

  it('should wrap a thrown value that is not an error', async () => {
    await expect(
      runTransaction(async () => {
        // oxlint-disable-next-line no-throw-literal
        throw 'not an error instance';
      }),
    ).rejects.toThrow('not an error instance');
  }, 60000);
});

describe('Transient database error mapping on the ORM v1 path', () => {
  beforeAll(async () => {
    await setOrmV2ReadPath(false);
  }, 60000);

  afterAll(async () => {
    await setOrmV2ReadPath(true);
  }, 60000);

  it.each(TRANSIENT_POSTGRESQL_ERROR_CODES)(
    'should map sqlstate %s to a transient database error',
    async (sqlState) => {
      await expect(runTransactionRaising(sqlState)).rejects.toMatchObject({
        code: TRANSIENT_DATABASE_ERROR,
      });
    },
    60000,
  );

  it('should not map a unique violation to a transient database error', async () => {
    await expect(
      runTransactionRaising(UNIQUE_VIOLATION),
    ).rejects.not.toMatchObject({ code: TRANSIENT_DATABASE_ERROR });
  }, 60000);

  it('should keep the transient mapping when the rollback fails on the killed connection', async () => {
    const globalWorkspaceOrmManager = getGlobalWorkspaceOrmManager();

    await expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () =>
          globalWorkspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              await transactionScope.executeRawQuery(
                'SELECT pg_terminate_backend(pg_backend_pid())',
              );
            },
          ),
        authContext,
        { lite: true },
      ),
    ).rejects.toMatchObject({ code: TRANSIENT_DATABASE_ERROR });
  }, 60000);

  it('should rethrow a thrown value that is not an error unchanged', async () => {
    await expect(
      runTransaction(async () => {
        // oxlint-disable-next-line no-throw-literal
        throw 'not an error instance';
      }),
    ).rejects.toBe('not an error instance');
  }, 60000);
});
