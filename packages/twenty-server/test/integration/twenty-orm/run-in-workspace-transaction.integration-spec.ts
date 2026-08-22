import { randomUUID } from 'node:crypto';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const BYPASS_PERMISSIONS = { shouldBypassPermissionChecks: true } as const;

describe('runInWorkspaceTransaction', () => {
  const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

  let globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  let workspaceSchemaName: string;

  const readCompanyIds = async (companyId: string): Promise<unknown[]> =>
    getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).manager.query(
      `SELECT id FROM "${workspaceSchemaName}"."company" WHERE id = $1`,
      [companyId],
    );

  beforeAll(() => {
    globalWorkspaceOrmManager =
      getAppProviderByClassName<GlobalWorkspaceOrmManager>(
        'GlobalWorkspaceOrmManager',
      );

    workspaceSchemaName = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
  }, 60000);

  it('should run a repository write on the connection that opened the transaction', async () => {
    const companyId = randomUUID();

    const transactionIds =
      await globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () =>
          globalWorkspaceOrmManager.runInWorkspaceTransaction(async (scope) => {
            const beforeWrite = await scope.executeRawQuery(
              'SELECT txid_current_if_assigned() AS txid',
            );

            await scope
              .getRepository('company', BYPASS_PERMISSIONS)
              .insert({ id: companyId, name: `transaction-binding` });

            const afterWrite = await scope.executeRawQuery(
              'SELECT txid_current_if_assigned() AS txid',
            );

            return {
              beforeWrite: beforeWrite[0].txid,
              afterWrite: afterWrite[0].txid,
            };
          }),
        authContext,
        { lite: true },
      );

    expect(transactionIds.beforeWrite).toBeNull();
    expect(transactionIds.afterWrite).not.toBeNull();
  }, 60000);

  it('should hide a repository write from other connections until the transaction commits', async () => {
    const companyId = randomUUID();

    const idsVisibleDuringTransaction =
      await globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () =>
          globalWorkspaceOrmManager.runInWorkspaceTransaction(async (scope) => {
            await scope
              .getRepository('company', BYPASS_PERMISSIONS)
              .insert({ id: companyId, name: `transaction-isolation` });

            return readCompanyIds(companyId);
          }),
        authContext,
        { lite: true },
      );

    expect(idsVisibleDuringTransaction).toHaveLength(0);
    await expect(readCompanyIds(companyId)).resolves.toHaveLength(1);
  }, 60000);

  it('should surface the original error when the rollback itself fails', async () => {
    await expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () =>
          globalWorkspaceOrmManager.runInWorkspaceTransaction(async (scope) => {
            const backends = await scope.executeRawQuery(
              'SELECT pg_backend_pid() AS pid',
            );

            await getCoreRepository<CalendarChannelEntity>(
              CalendarChannelEntity,
            ).manager.query('SELECT pg_terminate_backend($1)', [
              backends[0].pid,
            ]);

            throw new Error('original work failure');
          }),
        authContext,
        { lite: true },
      ),
    ).rejects.toThrow('original work failure');
  }, 60000);

  it('should discard a repository write when the transaction throws', async () => {
    const companyId = randomUUID();

    await expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () =>
          globalWorkspaceOrmManager.runInWorkspaceTransaction(async (scope) => {
            await scope
              .getRepository('company', BYPASS_PERMISSIONS)
              .insert({ id: companyId, name: `transaction-rollback` });

            throw new Error('forced rollback');
          }),
        authContext,
        { lite: true },
      ),
    ).rejects.toThrow('forced rollback');

    await expect(readCompanyIds(companyId)).resolves.toHaveLength(0);
  }, 60000);
});
