/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  ACCESS_GROUP_SYNC_LOCK_OPTIONS,
  buildAccessGroupSyncLockKey,
} from 'src/engine/permissions/internal/access-group/constants/access-group-sync-lock.constant';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { buildWorkspaceAccessGroups } from 'src/engine/permissions/internal/access-group/utils/build-workspace-access-groups.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AccessGroupSyncService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupRepository: AccessGroupRepository,
    private readonly recordAccessGroupComputationService: RecordAccessGroupComputationService,
    private readonly accessGroupSyncSchedulerService: AccessGroupSyncSchedulerService,
  ) {}

  async syncAccessGroups(workspaceId: string): Promise<void> {
    await this.cacheLockService.withLock(
      () => this.syncAccessGroupsWithLock(workspaceId),
      buildAccessGroupSyncLockKey(workspaceId),
      ACCESS_GROUP_SYNC_LOCK_OPTIONS,
    );
  }

  private async syncAccessGroupsWithLock(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);

    const workspaceCache = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        'featureFlagsMap',
        'rolesPermissions',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'userWorkspaceRoleMap',
        'flatWorkspaceMemberMaps',
      ],
    );
    const { accessGroups: newAccessGroups, hasFailures } =
      buildWorkspaceAccessGroups(workspaceCache);

    const existingAccessGroups =
      await this.accessGroupRepository.findAccessGroups(workspaceId);
    const existingGroupHashes = new Set(
      existingAccessGroups.map(({ groupHash }) => groupHash),
    );
    const newGroupHashes = new Set(
      newAccessGroups.map(({ groupHash }) => groupHash),
    );
    const insertedAccessGroups = newAccessGroups.filter(
      ({ groupHash }) => !existingGroupHashes.has(groupHash),
    );
    const canDeleteStaleAccessGroups =
      !hasFailures && newAccessGroups.length > 0;
    const staleAccessGroups = existingAccessGroups.filter(
      ({ groupHash }) =>
        canDeleteStaleAccessGroups && !newGroupHashes.has(groupHash),
    );

    const objectMetadataIdsToRecompute =
      await this.recordAccessGroupComputationService.filterObjectsUsingRecordAccessGroups(
        {
          workspaceId,
          objectMetadataIds: [
            ...new Set(
              [...insertedAccessGroups, ...staleAccessGroups].map(
                ({ objectMetadataId }) => objectMetadataId,
              ),
            ),
          ],
        },
      );

    await Promise.all(
      objectMetadataIdsToRecompute.map((objectMetadataId) =>
        this.accessGroupSyncSchedulerService.scheduleRecordAccessGroupIdsRecompute(
          { workspaceId, objectMetadataId },
        ),
      ),
    );

    await this.accessGroupRepository.insertAccessGroups({
      workspaceId,
      newAccessGroups: insertedAccessGroups,
    });

    if (isNonEmptyArray(staleAccessGroups)) {
      await this.accessGroupRepository.deleteAccessGroups({
        workspaceId,
        groupHashes: staleAccessGroups.map(({ groupHash }) => groupHash),
      });
    }
  }
}
