/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ACCESS_GROUP_PROPAGATION_PROGRESS_TTL_MS } from 'src/engine/permissions/internal/access-group/constants/access-group-propagation-progress-ttl-ms.constant';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';
import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';
import { buildRecordAccessGroupComputeKey } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-compute-key.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';

@Injectable()
export class AccessGroupPropagationProgressService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EnginePermissions)
    private readonly cacheStorageService: CacheStorageService,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
  ) {}

  async planComputes({
    workspaceId,
    objectMetadataIds,
  }: {
    workspaceId: string;
    objectMetadataIds: string[];
  }): Promise<void> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);
    const [plannedObjectComputeKeys, pendingObjectComputeCount] =
      await Promise.all([
        this.cacheStorageService.setMembers(
          this.buildPlannedObjectComputesCacheKey(workspaceId),
        ),
        this.cacheStorageService.getSetLength(
          this.buildPendingObjectComputesCacheKey(workspaceId),
        ),
      ]);
    const isPropagationRunning = pendingObjectComputeCount > 0;
    const newObjectComputes = planRecordAccessGroupComputes({
      objectMetadataIds,
      resolvedRelatedRecordPaths: metadataMaps.resolvedRelatedRecordPaths,
      isObjectUsingRecordAccessGroups: (objectMetadataId) =>
        isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId }),
    }).filter(
      (compute) =>
        !isPropagationRunning ||
        !plannedObjectComputeKeys.includes(
          buildRecordAccessGroupComputeKey(compute),
        ),
    );

    if (newObjectComputes.length === 0) {
      return;
    }

    if (!isPropagationRunning) {
      await this.clearPlan(workspaceId);
    }

    const plannedRecordCount =
      await this.recordAccessGroupRepository.estimateRecordCount({
        workspaceId,
        flatObjectMetadatas: newObjectComputes
          .map(({ objectMetadataId }) =>
            findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: objectMetadataId,
              flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
            }),
          )
          .filter(isDefined),
      });

    await this.cacheStorageService.setAdd(
      this.buildPlannedObjectComputesCacheKey(workspaceId),
      newObjectComputes.map(buildRecordAccessGroupComputeKey),
      ACCESS_GROUP_PROPAGATION_PROGRESS_TTL_MS,
    );
    await this.incrementRecordCount({
      key: this.buildTotalRecordCountCacheKey(workspaceId),
      recordCount: plannedRecordCount,
    });
  }

  // Only a scheduled compute is pending, so one the plan expected but no job ever queued cannot hold the progress open
  async markComputePending(
    jobData: RecomputeRecordAccessGroupIdsJobData,
  ): Promise<void> {
    await this.cacheStorageService.setAdd(
      this.buildPendingObjectComputesCacheKey(jobData.workspaceId),
      [buildRecordAccessGroupComputeKey(jobData)],
      ACCESS_GROUP_PROPAGATION_PROGRESS_TTL_MS,
    );
  }

  async trackComputedRecords({
    workspaceId,
    recordCount,
  }: {
    workspaceId: string;
    recordCount: number;
  }): Promise<void> {
    await this.incrementRecordCount({
      key: this.buildComputedRecordCountCacheKey(workspaceId),
      recordCount,
    });
    await this.cacheStorageService.expire(
      this.buildPendingObjectComputesCacheKey(workspaceId),
      ACCESS_GROUP_PROPAGATION_PROGRESS_TTL_MS,
    );
  }

  async finishCompute(
    jobData: RecomputeRecordAccessGroupIdsJobData,
  ): Promise<void> {
    const pendingObjectComputesCacheKey =
      this.buildPendingObjectComputesCacheKey(jobData.workspaceId);

    await this.cacheStorageService.setRemove(pendingObjectComputesCacheKey, [
      buildRecordAccessGroupComputeKey(jobData),
    ]);

    if (
      (await this.cacheStorageService.getSetLength(
        pendingObjectComputesCacheKey,
      )) === 0
    ) {
      await this.clearPlan(jobData.workspaceId);
    }
  }

  async findProgress(
    workspaceId: string,
  ): Promise<AccessGroupPropagationProgress> {
    const pendingObjectComputeCount =
      await this.cacheStorageService.getSetLength(
        this.buildPendingObjectComputesCacheKey(workspaceId),
      );

    if (pendingObjectComputeCount === 0) {
      return {
        totalRecordCount: 0,
        remainingRecordCount: 0,
        isInProgress: false,
      };
    }

    const [plannedRecordCount = 0, computedRecordCount = 0] =
      await this.cacheStorageService.mget<number>([
        this.buildTotalRecordCountCacheKey(workspaceId),
        this.buildComputedRecordCountCacheKey(workspaceId),
      ]);
    // The plan is an estimate, so the total follows the records actually computed when they exceed it
    const totalRecordCount = Math.max(plannedRecordCount, computedRecordCount);

    return {
      totalRecordCount,
      remainingRecordCount: totalRecordCount - computedRecordCount,
      isInProgress: true,
    };
  }

  private async incrementRecordCount({
    key,
    recordCount,
  }: {
    key: string;
    recordCount: number;
  }): Promise<void> {
    await this.cacheStorageService.incrBy(key, recordCount);
    await this.cacheStorageService.expire(
      key,
      ACCESS_GROUP_PROPAGATION_PROGRESS_TTL_MS,
    );
  }

  private async clearPlan(workspaceId: string): Promise<void> {
    await this.cacheStorageService.mdel([
      this.buildPlannedObjectComputesCacheKey(workspaceId),
      this.buildTotalRecordCountCacheKey(workspaceId),
      this.buildComputedRecordCountCacheKey(workspaceId),
    ]);
  }

  private buildPendingObjectComputesCacheKey(workspaceId: string): string {
    return `access-group-propagation:${workspaceId}:pending-object-computes`;
  }

  private buildPlannedObjectComputesCacheKey(workspaceId: string): string {
    return `access-group-propagation:${workspaceId}:planned-object-computes`;
  }

  private buildTotalRecordCountCacheKey(workspaceId: string): string {
    return `access-group-propagation:${workspaceId}:total-record-count`;
  }

  private buildComputedRecordCountCacheKey(workspaceId: string): string {
    return `access-group-propagation:${workspaceId}:computed-record-count`;
  }
}
