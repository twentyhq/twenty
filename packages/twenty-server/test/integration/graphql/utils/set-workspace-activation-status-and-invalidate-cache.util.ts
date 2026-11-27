import { setWorkspaceActivationStatus } from 'test/integration/graphql/utils/set-workspace-activation-status.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';

export const setWorkspaceActivationStatusAndInvalidateCache = async ({
  workspaceId,
  activationStatus,
}: {
  workspaceId: string;
  activationStatus: WorkspaceActivationStatus;
}) => {
  await setWorkspaceActivationStatus({ workspaceId, activationStatus });
  await getAppProviderByClassName<CoreEntityCacheService>(
    'CoreEntityCacheService',
  ).invalidate('workspaceEntity', workspaceId);
};
