/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { ACCESS_GROUP_COUNT_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/access-group-count-bucket-boundaries.constant';
import { ACCESS_GROUP_SYNC_DURATION_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/access-group-sync-duration-ms-bucket-boundaries.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import {
  ACCESS_GROUP_SYNC_LOCK_OPTIONS,
  buildAccessGroupSyncLockKey,
} from 'src/engine/permissions/internal/access-group/constants/access-group-sync-lock.constant';
import { ACCESS_GROUP_TYPES } from 'src/engine/permissions/internal/access-group/constants/access-group-types.constant';
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group-without-compact-id.type';
import { AccessGroupPropagationPlanService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-plan.service';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { type SyncAccessGroupsJobData } from 'src/engine/permissions/internal/access-group/types/sync-access-groups-job-data.type';
import { buildAccessGroupComputePlanSteps } from 'src/engine/permissions/internal/access-group/utils/build-access-group-compute-plan-steps.util';
import { buildWorkspaceAccessGroups } from 'src/engine/permissions/internal/access-group/utils/build-workspace-access-groups.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';

@Injectable()
export class AccessGroupSyncService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupRepository: AccessGroupRepository,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly accessGroupPropagationPlanService: AccessGroupPropagationPlanService,
    private readonly metricsService: MetricsService,
  ) {}

  async syncAccessGroups({
    workspaceId,
    isRelatedRecordPathChanged = false,
  }: SyncAccessGroupsJobData): Promise<void> {
    await this.cacheLockService.withLock(
      () =>
        this.syncAccessGroupsWithLock({
          workspaceId,
          isRelatedRecordPathChanged,
        }),
      buildAccessGroupSyncLockKey(workspaceId),
      ACCESS_GROUP_SYNC_LOCK_OPTIONS,
    );
  }

  private async syncAccessGroupsWithLock({
    workspaceId,
    isRelatedRecordPathChanged,
  }: Required<SyncAccessGroupsJobData>): Promise<void> {
    const syncStart = performance.now();

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
        'rlsWorkspaceMemberRelationValueMaps',
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
    const accessGroupsToInsert = newAccessGroups.filter(
      ({ groupHash }) => !existingGroupHashes.has(groupHash),
    );
    const canDeleteStaleAccessGroups =
      !hasFailures && newAccessGroups.length > 0;
    const staleAccessGroups = existingAccessGroups.filter(
      ({ groupHash }) =>
        canDeleteStaleAccessGroups && !newGroupHashes.has(groupHash),
    );

    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);

    await this.accessGroupPropagationPlanService.persistPlanSteps({
      workspaceId,
      steps: buildAccessGroupComputePlanSteps({
        accessGroupsToInsert,
        staleAccessGroups,
        relatedRecordPathTargetObjectMetadataIds: isRelatedRecordPathChanged
          ? metadataMaps.resolvedRelatedRecordPaths.map(
              ({ targetObjectMetadataId }) => targetObjectMetadataId,
            )
          : [],
        metadataMaps,
      }),
    });

    await this.accessGroupRepository.insertAccessGroups({
      workspaceId,
      newAccessGroups: accessGroupsToInsert,
    });

    if (isNonEmptyArray(staleAccessGroups)) {
      await this.accessGroupRepository.deleteAccessGroups({
        workspaceId,
        groupHashes: staleAccessGroups.map(({ groupHash }) => groupHash),
      });
    }

    this.recordSyncMetrics({
      durationMs: performance.now() - syncStart,
      accessGroupCount: newAccessGroups.length,
      accessGroupsToInsert,
      deletedAccessGroupCount: staleAccessGroups.length,
      hasFailures,
    });
  }

  private recordSyncMetrics({
    durationMs,
    accessGroupCount,
    accessGroupsToInsert,
    deletedAccessGroupCount,
    hasFailures,
  }: {
    durationMs: number;
    accessGroupCount: number;
    accessGroupsToInsert: AccessGroupWithoutCompactId[];
    deletedAccessGroupCount: number;
    hasFailures: boolean;
  }): void {
    this.metricsService.recordHistogram({
      key: MetricsKeys.AccessGroupSyncDurationMs,
      value: durationMs,
      unit: 'ms',
      bucketBoundaries: ACCESS_GROUP_SYNC_DURATION_MS_BUCKET_BOUNDARIES,
    });
    this.metricsService.recordHistogram({
      key: MetricsKeys.AccessGroupSyncAccessGroupCount,
      value: accessGroupCount,
      bucketBoundaries: ACCESS_GROUP_COUNT_BUCKET_BOUNDARIES,
    });

    for (const type of ACCESS_GROUP_TYPES) {
      const insertedCount = accessGroupsToInsert.filter(
        (accessGroup) => accessGroup.type === type,
      ).length;

      if (insertedCount > 0) {
        this.metricsService.incrementCounterBy({
          key: MetricsKeys.AccessGroupSyncAccessGroupsInserted,
          amount: insertedCount,
          attributes: { type },
        });
      }
    }

    if (deletedAccessGroupCount > 0) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AccessGroupSyncAccessGroupsDeleted,
        amount: deletedAccessGroupCount,
      });
    }

    if (hasFailures) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AccessGroupSyncBuildFailed,
        amount: 1,
      });
    }
  }
}
