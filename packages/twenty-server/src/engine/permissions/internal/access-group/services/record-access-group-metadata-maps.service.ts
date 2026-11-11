/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { findEnabledFlatRelatedRecordPathMaps } from 'src/engine/permissions/internal/related-record-path/utils/find-enabled-flat-related-record-path-maps.util';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordAccessGroupMetadataMapsService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

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
        flatRelatedRecordPathMaps: await findEnabledFlatRelatedRecordPathMaps({
          workspaceCacheService: this.workspaceCacheService,
          workspaceId,
          featureFlagsMap: metadataMaps.featureFlagsMap,
        }),
      }),
    };
  }
}
