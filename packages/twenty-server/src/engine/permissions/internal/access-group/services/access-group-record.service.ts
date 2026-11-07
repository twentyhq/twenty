/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type RecomputeAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-access-group-ids-job-data.type';
import { buildAccessGroupConditionOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-access-group-condition-or-throw.util';
import { AccessGroupRecordRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group-record.repository';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const RECOMPUTE_BATCH_SIZE = 1_000;

// Recomputes of one object run one at a time, so an older one cannot overwrite a newer one
const RECOMPUTE_LOCK_OPTIONS = { ms: 1_000, maxRetries: 900 };

@Injectable()
export class AccessGroupRecordService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupRepository: AccessGroupRepository,
    private readonly accessGroupRecordRepository: AccessGroupRecordRepository,
  ) {}

  async recomputeAccessGroupIds(
    jobData: RecomputeAccessGroupIdsJobData,
  ): Promise<void> {
    await this.cacheLockService.withLock(
      () => this.recomputeAccessGroupIdsWithLock(jobData),
      `access-group-ids-recompute:${jobData.workspaceId}:${jobData.objectMetadataId}`,
      RECOMPUTE_LOCK_OPTIONS,
    );
  }

  private async recomputeAccessGroupIdsWithLock({
    workspaceId,
    objectMetadataId,
    heldCompactIds,
  }: RecomputeAccessGroupIdsJobData): Promise<void> {
    await this.workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);

    const metadataMaps = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatRowLevelPermissionPredicateMaps',
        'flatRowLevelPermissionPredicateGroupMaps',
      ],
    );
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });

    if (
      !isDefined(flatObjectMetadata) ||
      isPermissionStorageObject(flatObjectMetadata)
    ) {
      return;
    }

    const tableAlias = flatObjectMetadata.nameSingular;
    const accessGroups =
      await this.accessGroupRepository.findObjectAccessGroups({
        workspaceId,
        objectMetadataId,
      });
    const accessGroupRecordConditions = accessGroups.map((accessGroup) => ({
      compactId: accessGroup.compactId,
      condition: buildAccessGroupConditionOrThrow({
        accessGroup,
        flatObjectMetadata,
        tableAlias,
        metadataMaps,
      }),
    }));

    let afterRecordId: string | null = null;

    do {
      afterRecordId =
        await this.accessGroupRecordRepository.recomputeAccessGroupIdsBatch({
          workspaceId,
          flatObjectMetadata,
          tableAlias,
          accessGroupRecordConditions,
          afterRecordId,
          heldCompactIds,
          batchSize: RECOMPUTE_BATCH_SIZE,
        });
    } while (isDefined(afterRecordId));
  }
}
