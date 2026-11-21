/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { type AccessGroupComputePlanStep } from 'src/engine/permissions/internal/access-group/types/access-group-compute-plan-step.type';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';
import { areRecordAccessGroupComputesAlreadyPlanned } from 'src/engine/permissions/internal/access-group/utils/are-record-access-group-computes-already-planned.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const COMPUTE_OPERATION_NAME = 'compute_recordAccessGroupIds';

@Injectable()
export class AccessGroupPropagationPlanService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly cacheLockService: CacheLockService,
    private readonly deferredWorkspaceOperationRunnerService: DeferredWorkspaceOperationRunnerService,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
  ) {}

  async persistPlanSteps({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: Pick<
      AccessGroupComputePlanStep,
      'objectMetadataId' | 'accessGroupIdChanges'
    >[];
  }): Promise<void> {
    if (!isNonEmptyArray(steps)) {
      return;
    }

    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);

    await this.cacheLockService.withLock(async () => {
      const waitingComputePayloads =
        await this.deferredWorkspaceOperationRunnerService.findOperationPayloads(
          {
            workspaceId,
            name: COMPUTE_OPERATION_NAME,
            statuses: ['PENDING'],
          },
        );
      const fullStepObjectMetadataIds = steps
        .filter(({ accessGroupIdChanges }) => !isDefined(accessGroupIdChanges))
        .map(({ objectMetadataId }) => objectMetadataId);
      const areFullStepsAlreadyPlanned =
        areRecordAccessGroupComputesAlreadyPlanned({
          waitingObjectMetadataIds: waitingComputePayloads.flatMap(
            ({ objectComputes }) =>
              objectComputes
                .filter(
                  ({ isComputed, accessGroupIdChanges }) =>
                    !isComputed && !isDefined(accessGroupIdChanges),
                )
                .map(({ objectMetadataId }) => objectMetadataId),
          ),
          objectMetadataIds: fullStepObjectMetadataIds,
        });
      const stepsToPersist = steps.filter(
        ({ accessGroupIdChanges }) =>
          isDefined(accessGroupIdChanges) || !areFullStepsAlreadyPlanned,
      );

      if (!isNonEmptyArray(stepsToPersist)) {
        return;
      }

      const recordCountByObjectMetadataId =
        await this.recordAccessGroupRepository.estimateRecordCountByObjectMetadataId(
          {
            workspaceId,
            flatObjectMetadatas: [
              ...new Set(
                stepsToPersist.map(({ objectMetadataId }) => objectMetadataId),
              ),
            ]
              .map((objectMetadataId) =>
                findFlatEntityByIdInFlatEntityMaps({
                  flatEntityId: objectMetadataId,
                  flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
                }),
              )
              .filter(isDefined),
          },
        );
      const queryRunner = this.coreDataSource.createQueryRunner();

      try {
        await this.deferredWorkspaceOperationRunnerService.persist({
          workspaceId,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION.universalIdentifier,
          deferredOperations: [
            {
              name: COMPUTE_OPERATION_NAME,
              payload: {
                objectComputes: stepsToPersist.map((step) => ({
                  ...step,
                  plannedRecordCount:
                    recordCountByObjectMetadataId.get(step.objectMetadataId) ??
                    0,
                  computedRecordCount: 0,
                  isComputed: false,
                })),
              },
            },
          ],
          queryRunner,
        });
      } finally {
        await queryRunner.release();
      }

      await this.deferredWorkspaceOperationRunnerService.enqueue(workspaceId);
    }, `access-group-propagation-plan:${workspaceId}`);
  }

  async trackComputedRecords({
    workspaceId,
    recordCount,
    afterRecordId,
  }: {
    workspaceId: string;
    recordCount: number;
    afterRecordId: string;
  }): Promise<void> {
    await this.updateNextObjectCompute({
      workspaceId,
      updateObjectCompute: (objectCompute) => ({
        ...objectCompute,
        computedRecordCount: objectCompute.computedRecordCount + recordCount,
        afterRecordId,
      }),
    });
  }

  async completeNextObjectCompute(workspaceId: string): Promise<void> {
    await this.updateNextObjectCompute({
      workspaceId,
      updateObjectCompute: (objectCompute) => ({
        ...objectCompute,
        isComputed: true,
      }),
    });
  }

  async findProgress(
    workspaceId: string,
  ): Promise<AccessGroupPropagationProgress> {
    const computePayloads =
      await this.deferredWorkspaceOperationRunnerService.findOperationPayloads({
        workspaceId,
        name: COMPUTE_OPERATION_NAME,
        statuses: ['PENDING', 'IN_PROGRESS'],
      });
    const recordCounts = computePayloads
      .flatMap(({ objectComputes }) => objectComputes)
      .map(({ plannedRecordCount, computedRecordCount, isComputed }) => {
        const totalRecordCount = Math.max(
          plannedRecordCount,
          computedRecordCount,
        );

        return {
          totalRecordCount,
          remainingRecordCount: isComputed
            ? 0
            : totalRecordCount - computedRecordCount,
        };
      });

    return {
      totalRecordCount: recordCounts.reduce(
        (recordCount, { totalRecordCount }) => recordCount + totalRecordCount,
        0,
      ),
      remainingRecordCount: recordCounts.reduce(
        (recordCount, { remainingRecordCount }) =>
          recordCount + remainingRecordCount,
        0,
      ),
      isInProgress: isNonEmptyArray(computePayloads),
    };
  }

  private async updateNextObjectCompute({
    workspaceId,
    updateObjectCompute,
  }: {
    workspaceId: string;
    updateObjectCompute: (
      objectCompute: AccessGroupComputePlanStep,
    ) => AccessGroupComputePlanStep;
  }): Promise<void> {
    await this.deferredWorkspaceOperationRunnerService.updateInProgressOperationPayload(
      {
        workspaceId,
        name: COMPUTE_OPERATION_NAME,
        updatePayload: ({ objectComputes }) => {
          const nextObjectComputeIndex = objectComputes.findIndex(
            ({ isComputed }) => !isComputed,
          );

          return {
            objectComputes: objectComputes.map((objectCompute, index) =>
              index === nextObjectComputeIndex
                ? updateObjectCompute(objectCompute)
                : objectCompute,
            ),
          };
        },
      },
    );
  }
}
