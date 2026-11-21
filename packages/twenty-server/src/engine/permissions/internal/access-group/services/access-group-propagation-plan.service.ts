/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';
import { areRecordAccessGroupComputesAlreadyPlanned } from 'src/engine/permissions/internal/access-group/utils/are-record-access-group-computes-already-planned.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const COMPUTE_OPERATION_NAME = 'compute_recordAccessGroupIds';

type ObjectCompute = DeferredWorkspaceOperationPayload<
  typeof COMPUTE_OPERATION_NAME
>['objectComputes'][number];

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

  async planAndApplyComputes({
    workspaceId,
    objectMetadataIds,
  }: {
    workspaceId: string;
    objectMetadataIds: string[];
  }): Promise<void> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);
    const plannedObjectMetadataIds = this.planObjectMetadataIds({
      metadataMaps,
      objectMetadataIds,
    });

    await this.persistObjectComputes({
      workspaceId,
      metadataMaps,
      findObjectComputesToPersist: (waitingObjectComputes) =>
        areRecordAccessGroupComputesAlreadyPlanned({
          waitingObjectMetadataIds: waitingObjectComputes
            .filter(
              ({ accessGroupIdChanges }) => !isDefined(accessGroupIdChanges),
            )
            .map(({ objectMetadataId }) => objectMetadataId),
          objectMetadataIds: plannedObjectMetadataIds,
        })
          ? []
          : plannedObjectMetadataIds.map((objectMetadataId) => ({
              objectMetadataId,
            })),
    });
  }

  async planAndApplyAccessGroupIdChanges({
    workspaceId,
    objectMetadataId,
    addedCompactIds,
    removedCompactIds,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    addedCompactIds: number[];
    removedCompactIds: number[];
  }): Promise<void> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);
    const plannedObjectMetadataIds = [
      ...new Set(
        this.planObjectMetadataIds({
          metadataMaps,
          objectMetadataIds: [objectMetadataId],
        }),
      ),
    ];

    await this.persistObjectComputes({
      workspaceId,
      metadataMaps,
      findObjectComputesToPersist: (waitingObjectComputes) => {
        const objectMetadataIdsWaitingFullCompute = new Set(
          waitingObjectComputes
            .filter(
              ({ accessGroupIdChanges }) => !isDefined(accessGroupIdChanges),
            )
            .map(({ objectMetadataId }) => objectMetadataId),
        );

        return plannedObjectMetadataIds
          .filter(
            (plannedObjectMetadataId) =>
              !objectMetadataIdsWaitingFullCompute.has(plannedObjectMetadataId),
          )
          .map((plannedObjectMetadataId) => ({
            objectMetadataId: plannedObjectMetadataId,
            accessGroupIdChanges: {
              addedCompactIds:
                plannedObjectMetadataId === objectMetadataId
                  ? addedCompactIds
                  : [],
              removedCompactIds,
            },
          }));
      },
    });
  }

  private planObjectMetadataIds({
    metadataMaps,
    objectMetadataIds,
  }: {
    metadataMaps: RecordAccessGroupComputationMetadataMaps;
    objectMetadataIds: string[];
  }): string[] {
    return planRecordAccessGroupComputes({
      objectMetadataIds,
      resolvedRelatedRecordPaths: metadataMaps.resolvedRelatedRecordPaths,
      isObjectUsingRecordAccessGroups: (objectMetadataId) =>
        isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId }),
    });
  }

  private async persistObjectComputes({
    workspaceId,
    metadataMaps,
    findObjectComputesToPersist,
  }: {
    workspaceId: string;
    metadataMaps: RecordAccessGroupComputationMetadataMaps;
    findObjectComputesToPersist: (
      waitingObjectComputes: ObjectCompute[],
    ) => Pick<ObjectCompute, 'objectMetadataId' | 'accessGroupIdChanges'>[];
  }): Promise<void> {
    await this.cacheLockService.withLock(async () => {
      const waitingComputePayloads =
        await this.deferredWorkspaceOperationRunnerService.findOperationPayloads(
          {
            workspaceId,
            name: COMPUTE_OPERATION_NAME,
            statuses: ['PENDING'],
          },
        );
      const objectComputesToPersist = findObjectComputesToPersist(
        waitingComputePayloads.flatMap(({ objectComputes }) =>
          objectComputes.filter(({ isComputed }) => !isComputed),
        ),
      );

      if (!isNonEmptyArray(objectComputesToPersist)) {
        return;
      }

      const recordCountByObjectMetadataId =
        await this.recordAccessGroupRepository.estimateRecordCountByObjectMetadataId(
          {
            workspaceId,
            flatObjectMetadatas: [
              ...new Set(
                objectComputesToPersist.map(
                  ({ objectMetadataId }) => objectMetadataId,
                ),
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
                objectComputes: objectComputesToPersist.map(
                  (objectCompute) => ({
                    ...objectCompute,
                    plannedRecordCount:
                      recordCountByObjectMetadataId.get(
                        objectCompute.objectMetadataId,
                      ) ?? 0,
                    computedRecordCount: 0,
                    isComputed: false,
                  }),
                ),
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
  }: {
    workspaceId: string;
    recordCount: number;
  }): Promise<void> {
    await this.updateNextObjectCompute({
      workspaceId,
      updateObjectCompute: (objectCompute) => ({
        ...objectCompute,
        computedRecordCount: objectCompute.computedRecordCount + recordCount,
      }),
    });
  }

  async startNextObjectCompute(workspaceId: string): Promise<void> {
    await this.updateNextObjectCompute({
      workspaceId,
      updateObjectCompute: (objectCompute) => ({
        ...objectCompute,
        computedRecordCount: 0,
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
    updateObjectCompute: (objectCompute: ObjectCompute) => ObjectCompute;
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
