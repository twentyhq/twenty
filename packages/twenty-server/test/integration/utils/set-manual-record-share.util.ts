import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { buildRecordShareLockKey } from 'src/engine/core-modules/record-share/utils/build-record-share-lock-key.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

export const setManualRecordShare = (
  args: Omit<
    Parameters<RecordShareStorageService['setManualShare']>[0],
    'transactionScope'
  >,
): Promise<void> => {
  const manager = getAppProviderByClassName<WorkspaceOrmManager>(
    'WorkspaceOrmManager',
  );
  const storage = getAppProviderByClassName<RecordShareStorageService>(
    'RecordShareStorageService',
  );
  return manager.executeInWorkspaceContext(
    () =>
      manager.runInWorkspaceTransaction(async (transactionScope) => {
        await transactionScope.executeRawQuery(
          'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
          [
            buildRecordShareLockKey({
              workspaceId: args.workspaceId,
              ...args.share,
            }),
          ],
        );
        await storage.setManualShare({ ...args, transactionScope });
      }),
    buildSystemAuthContext(args.workspaceId),
  );
};
