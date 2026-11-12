/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ACCESS_GROUP_PROPAGATION_PLAN_TTL_MS } from 'src/engine/permissions/internal/access-group/constants/access-group-propagation-plan-ttl-ms.constant';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { type AccessGroupPropagationPlan } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-plan.type';
import { type ApplyAccessGroupPropagationPlanJobData } from 'src/engine/permissions/internal/access-group/types/apply-access-group-propagation-plan-job-data.type';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';
import { areRecordAccessGroupComputesAlreadyPlanned } from 'src/engine/permissions/internal/access-group/utils/are-record-access-group-computes-already-planned.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';

const EMPTY_PLAN: AccessGroupPropagationPlan = {
  objectMetadataIdsToCompute: [],
  totalRecordCount: 0,
};

@Injectable()
export class AccessGroupPropagationPlanService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EnginePermissions)
    private readonly cacheStorageService: CacheStorageService,
    private readonly cacheLockService: CacheLockService,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
    private readonly accessGroupSyncSchedulerService: AccessGroupSyncSchedulerService,
  ) {}

  async planAndApplyComputes({
    workspaceId,
    objectMetadataIds,
  }: {
    workspaceId: string;
    objectMetadataIds: string[];
  }): Promise<void> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);
    const plannedObjectMetadataIds = planRecordAccessGroupComputes({
      objectMetadataIds,
      resolvedRelatedRecordPaths: metadataMaps.resolvedRelatedRecordPaths,
      isObjectUsingRecordAccessGroups: (objectMetadataId) =>
        isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId }),
    });

    if (!isNonEmptyArray(plannedObjectMetadataIds)) {
      return;
    }

    const plannedRecordCount =
      await this.recordAccessGroupRepository.estimateRecordCount({
        workspaceId,
        flatObjectMetadatas: plannedObjectMetadataIds
          .map((objectMetadataId) =>
            findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: objectMetadataId,
              flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
            }),
          )
          .filter(isDefined),
      });

    await this.withPlanLock({
      workspaceId,
      callback: async () => {
        const { objectMetadataIdsToCompute, totalRecordCount } =
          await this.findPlan(workspaceId);

        if (
          areRecordAccessGroupComputesAlreadyPlanned({
            waitingObjectMetadataIds: objectMetadataIdsToCompute.slice(1),
            objectMetadataIds: plannedObjectMetadataIds,
          })
        ) {
          return;
        }

        if (!isNonEmptyArray(objectMetadataIdsToCompute)) {
          await this.cacheStorageService.mdel([
            this.buildComputedRecordCountCacheKey(workspaceId),
            this.buildIsPlanStoppedCacheKey(workspaceId),
          ]);
        }

        const plan = {
          objectMetadataIdsToCompute: [
            ...objectMetadataIdsToCompute,
            ...plannedObjectMetadataIds,
          ],
          totalRecordCount: totalRecordCount + plannedRecordCount,
        };

        await this.saveAndApplyPlan({ workspaceId, plan });
      },
    });
  }

  async findNextObjectMetadataIdToCompute(
    applyJobData: ApplyAccessGroupPropagationPlanJobData,
  ): Promise<string | undefined> {
    const { objectMetadataIdsToCompute } = await this.withPlanLock({
      workspaceId: applyJobData.workspaceId,
      callback: () => this.findPlanOrRestoreFromApplyJobData(applyJobData),
    });

    return objectMetadataIdsToCompute[0];
  }

  async trackComputedRecords({
    workspaceId,
    recordCount,
  }: {
    workspaceId: string;
    recordCount: number;
  }): Promise<void> {
    const computedRecordCountCacheKey =
      this.buildComputedRecordCountCacheKey(workspaceId);

    await this.cacheStorageService.incrBy(
      computedRecordCountCacheKey,
      recordCount,
    );
    await this.cacheStorageService.expire(
      computedRecordCountCacheKey,
      ACCESS_GROUP_PROPAGATION_PLAN_TTL_MS,
    );
    await this.cacheStorageService.expire(
      this.buildPlanCacheKey(workspaceId),
      ACCESS_GROUP_PROPAGATION_PLAN_TTL_MS,
    );
  }

  async finishCompute({
    applyJobData,
    objectMetadataId,
  }: {
    applyJobData: ApplyAccessGroupPropagationPlanJobData;
    objectMetadataId: string;
  }): Promise<void> {
    const { workspaceId } = applyJobData;

    await this.withPlanLock({
      workspaceId,
      callback: async () => {
        const plan = await this.findPlanOrRestoreFromApplyJobData(applyJobData);
        const [runningObjectMetadataId, ...waitingObjectMetadataIds] =
          plan.objectMetadataIdsToCompute;

        if (runningObjectMetadataId !== objectMetadataId) {
          return;
        }

        if (!isNonEmptyArray(waitingObjectMetadataIds)) {
          await this.clearPlan(workspaceId);

          return;
        }

        await this.saveAndApplyPlan({
          workspaceId,
          plan: {
            ...plan,
            objectMetadataIdsToCompute: waitingObjectMetadataIds,
          },
        });
      },
    });
  }

  async stopPlan(workspaceId: string): Promise<void> {
    await this.withPlanLock({
      workspaceId,
      callback: async () => {
        await this.clearPlan(workspaceId);
        await this.cacheStorageService.set(
          this.buildIsPlanStoppedCacheKey(workspaceId),
          true,
          ACCESS_GROUP_PROPAGATION_PLAN_TTL_MS,
        );
      },
    });
  }

  async findProgress(
    workspaceId: string,
  ): Promise<AccessGroupPropagationProgress> {
    const plan = await this.findPlan(workspaceId);

    if (!isNonEmptyArray(plan.objectMetadataIdsToCompute)) {
      return {
        totalRecordCount: 0,
        remainingRecordCount: 0,
        isInProgress: false,
      };
    }

    const computedRecordCount = await this.findComputedRecordCount(workspaceId);
    const totalRecordCount = Math.max(
      plan.totalRecordCount,
      computedRecordCount,
    );

    return {
      totalRecordCount,
      remainingRecordCount: totalRecordCount - computedRecordCount,
      isInProgress: true,
    };
  }

  private async findPlanOrRestoreFromApplyJobData({
    workspaceId,
    plan,
    computedRecordCount,
  }: ApplyAccessGroupPropagationPlanJobData): Promise<AccessGroupPropagationPlan> {
    const cachedPlan = await this.findPlan(workspaceId);

    const isPlanStopped = await this.cacheStorageService.get<boolean>(
      this.buildIsPlanStoppedCacheKey(workspaceId),
    );

    if (
      isNonEmptyArray(cachedPlan.objectMetadataIdsToCompute) ||
      !isNonEmptyArray(plan.objectMetadataIdsToCompute) ||
      isPlanStopped === true
    ) {
      return cachedPlan;
    }

    const computedRecordCountCacheKey =
      this.buildComputedRecordCountCacheKey(workspaceId);

    await this.savePlan({ workspaceId, plan });
    await this.cacheStorageService.del(computedRecordCountCacheKey);
    await this.cacheStorageService.incrBy(
      computedRecordCountCacheKey,
      computedRecordCount,
    );
    await this.cacheStorageService.expire(
      computedRecordCountCacheKey,
      ACCESS_GROUP_PROPAGATION_PLAN_TTL_MS,
    );

    return plan;
  }

  private async saveAndApplyPlan({
    workspaceId,
    plan,
  }: {
    workspaceId: string;
    plan: AccessGroupPropagationPlan;
  }): Promise<void> {
    await this.savePlan({ workspaceId, plan });
    await this.accessGroupSyncSchedulerService.enqueueApplyAccessGroupPropagationPlanJob(
      {
        workspaceId,
        plan,
        computedRecordCount: await this.findComputedRecordCount(workspaceId),
      },
    );
  }

  private async findComputedRecordCount(workspaceId: string): Promise<number> {
    return (
      (await this.cacheStorageService.get<number>(
        this.buildComputedRecordCountCacheKey(workspaceId),
      )) ?? 0
    );
  }

  private async clearPlan(workspaceId: string): Promise<void> {
    await this.cacheStorageService.mdel([
      this.buildPlanCacheKey(workspaceId),
      this.buildComputedRecordCountCacheKey(workspaceId),
    ]);
  }

  private async findPlan(
    workspaceId: string,
  ): Promise<AccessGroupPropagationPlan> {
    return (
      (await this.cacheStorageService.get<AccessGroupPropagationPlan>(
        this.buildPlanCacheKey(workspaceId),
      )) ?? EMPTY_PLAN
    );
  }

  private async savePlan({
    workspaceId,
    plan,
  }: {
    workspaceId: string;
    plan: AccessGroupPropagationPlan;
  }): Promise<void> {
    await this.cacheStorageService.set(
      this.buildPlanCacheKey(workspaceId),
      plan,
      ACCESS_GROUP_PROPAGATION_PLAN_TTL_MS,
    );
  }

  private withPlanLock<TResult>({
    workspaceId,
    callback,
  }: {
    workspaceId: string;
    callback: () => Promise<TResult>;
  }): Promise<TResult> {
    return this.cacheLockService.withLock(
      callback,
      `access-group-propagation-plan:${workspaceId}`,
    );
  }

  private buildPlanCacheKey(workspaceId: string): string {
    return `access-group-propagation:${workspaceId}:plan`;
  }

  private buildIsPlanStoppedCacheKey(workspaceId: string): string {
    return `access-group-propagation:${workspaceId}:is-plan-stopped`;
  }

  private buildComputedRecordCountCacheKey(workspaceId: string): string {
    return `access-group-propagation:${workspaceId}:computed-record-count`;
  }
}
