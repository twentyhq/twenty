import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { raiseSqlState } from 'test/integration/utils/raise-sql-state.util';

const TRANSIENT_DATABASE_ERROR = 'TRANSIENT_DATABASE_ERROR';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const runInTransaction = (
  work: (transactionScope: WorkspaceTransactionScope) => Promise<unknown>,
): Promise<unknown> => {
  const workspaceOrmManager =
    getAppProviderByClassName<WorkspaceOrmManager>('WorkspaceOrmManager');

  return workspaceOrmManager.executeInWorkspaceContext(
    async () => workspaceOrmManager.runInWorkspaceTransaction(work),
    authContext,
    { lite: true },
  );
};

const runInTransactionRaising = (sqlState: string): Promise<unknown> =>
  runInTransaction(async (transactionScope) => {
    await transactionScope.executeRawQuery(raiseSqlState(sqlState));
  });

describe('Transient database error mapping', () => {
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
});
