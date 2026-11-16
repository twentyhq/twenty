/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type FeatureFlagKey } from 'twenty-shared/types';

import { isRelatedRecordPathsEnabled } from 'src/engine/permissions/internal/related-record-path/utils/is-related-record-paths-enabled.util';
import { type FlatRelatedRecordPathMaps } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path-maps.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RelatedRecordPathReadService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async findEnabledFlatRelatedRecordPathMaps({
    workspaceId,
    featureFlagsMap,
  }: {
    workspaceId: string;
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  }): Promise<FlatRelatedRecordPathMaps | undefined> {
    if (!isRelatedRecordPathsEnabled({ featureFlagsMap })) {
      return undefined;
    }

    const { flatRelatedRecordPathMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRelatedRecordPathMaps',
      ]);

    return flatRelatedRecordPathMaps;
  }
}
