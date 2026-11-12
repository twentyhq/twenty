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
import { buildRecordAccessGroupRecomputeKey } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-recompute-key.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planRecordAccessGroupRecomputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-recomputes.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';

@Injectable()
export class AccessGroupPropagationProgressService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EnginePermissions)
    private readonly cacheStorageService: CacheStorageService,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
  ) {}

  async planRecomputes({
    workspaceId,
    objectMetadataIds,
  }: {
    workspaceId: string;
    objectMetadataIds: string[];
  }): Promise<void> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);
    const pendingRecomputeKeys = new Set(
      await this.cacheStorageService.setMembers(
        this.buildPendingRecomputesKey(workspaceId),
      ),
    );
    const newRecomputes = planRecordAccessGroupRecomputes({
      objectMetadataIds,
      resolvedRelatedRecordPaths: metadataMaps.resolvedRelatedRecordPaths,
      isObjectUsingRecordAccessGroups: (objectMetadataId) =>
        isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId }),
    }).filter(
      (recompute) =>
        !pendingRecomputeKeys.has(
          buildRecordAccessGroupRecomputeKey(recompute),
        ),
    );

    if (newRecomputes.length === 0) {
      return;
    }

    if (pendingRecomputeKeys.size === 0) {
      await this.clearRecordCounts(workspaceId);
    }

    const plannedRecordCount =
      await this.recordAccessGroupRepository.estimateRecordCount({
        workspaceId,
        flatObjectMetadatas: newRecomputes
          .map(({ objectMetadataId }) =>
            findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: objectMetadataId,
              flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
            }),
          )
          .filter(isDefined),
      });

    await this.cacheStorageService.setAdd(
      this.buildPendingRecomputesKey(workspaceId),
      newRecomputes.map(buildRecordAccessGroupRecomputeKey),
      ACCESS_GROUP_PROPAGATION_PROGRESS_TTL_MS,
    );
    await this.incrementRecordCount({
      key: this.buildTotalRecordCountKey(workspaceId),
      recordCount: plannedRecordCount,
    });
  }

  // A job the plan did not list as pending still reads as in progress: one queued behind a running recompute of the same object, or one outliving the plan
  async startRecompute(
    jobData: RecomputeRecordAccessGroupIdsJobData,
  ): Promise<void> {
    await this.cacheStorageService.setAdd(
      this.buildPendingRecomputesKey(jobData.workspaceId),
      [buildRecordAccessGroupRecomputeKey(jobData)],
      ACCESS_GROUP_PROPAGATION_PROGRESS_TTL_MS,
    );
  }

  async trackRecomputedRecords({
    workspaceId,
    recordCount,
  }: {
    workspaceId: string;
    recordCount: number;
  }): Promise<void> {
    await this.incrementRecordCount({
      key: this.buildRecomputedRecordCountKey(workspaceId),
      recordCount,
    });
    await this.cacheStorageService.expire(
      this.buildPendingRecomputesKey(workspaceId),
      ACCESS_GROUP_PROPAGATION_PROGRESS_TTL_MS,
    );
  }

  async finishRecompute(
    jobData: RecomputeRecordAccessGroupIdsJobData,
  ): Promise<void> {
    const pendingRecomputesKey = this.buildPendingRecomputesKey(
      jobData.workspaceId,
    );

    await this.cacheStorageService.setRemove(pendingRecomputesKey, [
      buildRecordAccessGroupRecomputeKey(jobData),
    ]);

    if (
      (await this.cacheStorageService.getSetLength(pendingRecomputesKey)) === 0
    ) {
      await this.clearRecordCounts(jobData.workspaceId);
    }
  }

  async findProgress(
    workspaceId: string,
  ): Promise<AccessGroupPropagationProgress> {
    const pendingRecomputeCount = await this.cacheStorageService.getSetLength(
      this.buildPendingRecomputesKey(workspaceId),
    );

    if (pendingRecomputeCount === 0) {
      return {
        totalRecordCount: 0,
        remainingRecordCount: 0,
        isInProgress: false,
      };
    }

    const [plannedRecordCount = 0, recomputedRecordCount = 0] =
      await this.cacheStorageService.mget<number>([
        this.buildTotalRecordCountKey(workspaceId),
        this.buildRecomputedRecordCountKey(workspaceId),
      ]);
    // The plan is an estimate, so the total follows the records actually recomputed when they exceed it
    const totalRecordCount = Math.max(
      plannedRecordCount,
      recomputedRecordCount,
    );

    return {
      totalRecordCount,
      remainingRecordCount: totalRecordCount - recomputedRecordCount,
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

  private async clearRecordCounts(workspaceId: string): Promise<void> {
    await this.cacheStorageService.mdel([
      this.buildTotalRecordCountKey(workspaceId),
      this.buildRecomputedRecordCountKey(workspaceId),
    ]);
  }

  private buildPendingRecomputesKey(workspaceId: string): string {
    return `access-group-propagation:${workspaceId}:pending-recomputes`;
  }

  private buildTotalRecordCountKey(workspaceId: string): string {
    return `access-group-propagation:${workspaceId}:total-record-count`;
  }

  private buildRecomputedRecordCountKey(workspaceId: string): string {
    return `access-group-propagation:${workspaceId}:recomputed-record-count`;
  }
}
