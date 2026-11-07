/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  ACCESS_GROUP_SYNC_LOCK_OPTIONS,
  buildAccessGroupSyncLockKey,
} from 'src/engine/permissions/internal/access-group/constants/access-group-sync-lock.constant';
import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';
import { buildRecordAccessGroupConditionOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-condition-or-throw.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const RECOMPUTE_BATCH_SIZE = 1_000;

@Injectable()
export class RecordAccessGroupService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupRepository: AccessGroupRepository,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
  ) {}

  async recomputeRecordAccessGroupIds({
    workspaceId,
    objectMetadataId,
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

    // The sync queues this job before writing, so groups are read once its writes are done
    const accessGroups = await this.cacheLockService.withLock(
      () =>
        this.accessGroupRepository.findObjectAccessGroups({
          workspaceId,
          objectMetadataId,
        }),
      buildAccessGroupSyncLockKey(workspaceId),
      ACCESS_GROUP_SYNC_LOCK_OPTIONS,
    );
    const recordAccessGroupConditions = accessGroups.map((accessGroup) => ({
      compactId: accessGroup.compactId,
      condition: buildRecordAccessGroupConditionOrThrow({
        accessGroup,
        flatObjectMetadata,
        tableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
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
            recordAccessGroupConditions,
            afterRecordId,
            batchSize: RECOMPUTE_BATCH_SIZE,
          },
        );
    } while (isDefined(afterRecordId));
  }
}
