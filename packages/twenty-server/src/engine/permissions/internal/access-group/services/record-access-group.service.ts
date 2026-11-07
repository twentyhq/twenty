/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';
import { buildRecordAccessGroupConditionOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-condition-or-throw.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const RECOMPUTE_BATCH_SIZE = 1_000;

// Recomputes of one object run one at a time, so an older one cannot overwrite a newer one
const RECOMPUTE_LOCK_OPTIONS = { ms: 1_000, maxRetries: 900 };

@Injectable()
export class RecordAccessGroupService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupRepository: AccessGroupRepository,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
  ) {}

  async recomputeRecordAccessGroupIds(
    jobData: RecomputeRecordAccessGroupIdsJobData,
  ): Promise<void> {
    await this.cacheLockService.withLock(
      () => this.recomputeRecordAccessGroupIdsWithLock(jobData),
      `record-access-group-ids-recompute:${jobData.workspaceId}:${jobData.objectMetadataId}`,
      RECOMPUTE_LOCK_OPTIONS,
    );
  }

  private async recomputeRecordAccessGroupIdsWithLock({
    workspaceId,
    objectMetadataId,
    heldCompactIds,
  }: RecomputeRecordAccessGroupIdsJobData): Promise<void> {
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
    const recordAccessGroupConditions = accessGroups.map((accessGroup) => ({
      compactId: accessGroup.compactId,
      condition: buildRecordAccessGroupConditionOrThrow({
        accessGroup,
        flatObjectMetadata,
        tableAlias,
        metadataMaps,
      }),
    }));

    let afterRecordId: string | null = null;

    do {
      afterRecordId =
        await this.recordAccessGroupRepository.recomputeRecordAccessGroupIdsBatch(
          {
            workspaceId,
            flatObjectMetadata,
            tableAlias,
            recordAccessGroupConditions,
            afterRecordId,
            heldCompactIds,
            batchSize: RECOMPUTE_BATCH_SIZE,
          },
        );
    } while (isDefined(afterRecordId));
  }
}
