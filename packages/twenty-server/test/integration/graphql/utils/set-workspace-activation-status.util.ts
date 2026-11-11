import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';

// activationStatus has no update API, so it is set directly
export const setWorkspaceActivationStatus = async ({
  workspaceId,
  activationStatus,
}: {
  workspaceId: string;
  activationStatus: WorkspaceActivationStatus;
}): Promise<void> => {
  await globalThis.testDataSource.query(
    `UPDATE core."workspace" SET "activationStatus" = $1 WHERE "id" = $2`,
    [activationStatus, workspaceId],
  );

  await getAppProviderByClassName<CoreEntityCacheService>(
    'CoreEntityCacheService',
  ).invalidate('workspaceEntity', workspaceId);
};
