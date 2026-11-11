/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { type FlatRelatedRecordPathMaps } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path-maps.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const findEnabledFlatRelatedRecordPathMaps = async ({
  workspaceCacheService,
  workspaceId,
  featureFlagsMap,
}: {
  workspaceCacheService: WorkspaceCacheService;
  workspaceId: string;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): Promise<FlatRelatedRecordPathMaps | undefined> => {
  if (!featureFlagsMap[FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED]) {
    return undefined;
  }

  const { flatRelatedRecordPathMaps } =
    await workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRelatedRecordPathMaps',
    ]);

  return flatRelatedRecordPathMaps;
};
