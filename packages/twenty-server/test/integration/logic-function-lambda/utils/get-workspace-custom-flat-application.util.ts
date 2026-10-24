import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const getWorkspaceCustomFlatApplication = async (
  workspaceId: string,
): Promise<FlatApplication> => {
  const { workspaceCustomApplicationId } =
    await getCoreRepository<WorkspaceEntity>(WorkspaceEntity).findOneByOrFail({
      id: workspaceId,
    });

  const workspaceCacheService =
    getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');

  await workspaceCacheService.invalidateAndRecompute(workspaceId, [
    'flatApplicationMaps',
  ]);

  const { flatApplicationMaps } = await workspaceCacheService.getOrRecompute(
    workspaceId,
    ['flatApplicationMaps'],
  );

  const flatApplication =
    flatApplicationMaps.byId[workspaceCustomApplicationId];

  if (!isDefined(flatApplication)) {
    throw new Error(
      `Custom application ${workspaceCustomApplicationId} not found in workspace ${workspaceId}`,
    );
  }

  return flatApplication;
};
