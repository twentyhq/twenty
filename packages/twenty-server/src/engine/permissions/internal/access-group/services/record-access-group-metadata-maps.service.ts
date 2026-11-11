/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { RelatedRecordPathReadService } from 'src/engine/permissions/internal/related-record-path/services/related-record-path-read.service';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordAccessGroupMetadataMapsService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly relatedRecordPathReadService: RelatedRecordPathReadService,
  ) {}

  async findAfterEvictingLocalCache(
    workspaceId: string,
  ): Promise<RecordAccessGroupComputationMetadataMaps> {
    await this.workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);

    return this.find(workspaceId);
  }

  async find(
    workspaceId: string,
  ): Promise<RecordAccessGroupComputationMetadataMaps> {
    const metadataMaps = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        'featureFlagsMap',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'rolesPermissions',
      ],
    );
    return {
      ...metadataMaps,
      resolvedRelatedRecordPaths: resolveRelatedRecordPaths({
        ...metadataMaps,
        flatRelatedRecordPathMaps:
          await this.relatedRecordPathReadService.findEnabledFlatRelatedRecordPathMaps(
            { workspaceId, featureFlagsMap: metadataMaps.featureFlagsMap },
          ),
      }),
    };
  }
}
