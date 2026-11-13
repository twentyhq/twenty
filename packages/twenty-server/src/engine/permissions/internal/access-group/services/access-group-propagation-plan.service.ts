/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';
import { areRecordAccessGroupComputesAlreadyPlanned } from 'src/engine/permissions/internal/access-group/utils/are-record-access-group-computes-already-planned.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const COMPUTE_OPERATION_NAME = 'compute_recordAccessGroupIds';

@Injectable()
export class AccessGroupPropagationPlanService {
  constructor(
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
    const plannedObjectMetadataIds = planRecordAccessGroupComputes({
      objectMetadataIds,
      resolvedRelatedRecordPaths: metadataMaps.resolvedRelatedRecordPaths,
      isObjectUsingRecordAccessGroups: (objectMetadataId) =>
        isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId }),
    });

    if (!isNonEmptyArray(plannedObjectMetadataIds)) {
      return;
    }

    const recordCountByObjectMetadataId =
      await this.recordAccessGroupRepository.estimateRecordCountByObjectMetadataId(
        {
          workspaceId,
          flatObjectMetadatas: [...new Set(plannedObjectMetadataIds)]
            .map((objectMetadataId) =>
              findFlatEntityByIdInFlatEntityMaps({
                flatEntityId: objectMetadataId,
                flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
              }),
            )
            .filter(isDefined),
        },
      );

    await this.cacheLockService.withLock(async () => {
      const waitingComputePayloads =
        await this.deferredWorkspaceOperationRunnerService.findOperationPayloads(
          {
            workspaceId,
            name: COMPUTE_OPERATION_NAME,
            statuses: ['PENDING'],
          },
        );

      if (
        areRecordAccessGroupComputesAlreadyPlanned({
          waitingObjectMetadataIds: waitingComputePayloads.map(
            ({ objectMetadataId }) => objectMetadataId,
          ),
          objectMetadataIds: plannedObjectMetadataIds,
        })
      ) {
        return;
      }

      await this.deferredWorkspaceOperationRunnerService.persistAndEnqueue({
        workspaceId,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        deferredOperations: plannedObjectMetadataIds.map(
          (objectMetadataId) => ({
            name: COMPUTE_OPERATION_NAME,
            payload: {
              objectMetadataId,
              plannedRecordCount:
                recordCountByObjectMetadataId.get(objectMetadataId) ?? 0,
              computedRecordCount: 0,
            },
          }),
        ),
      });
    }, `access-group-propagation-plan:${workspaceId}`);
  }

  async trackComputedRecords({
    workspaceId,
    recordCount,
  }: {
    workspaceId: string;
    recordCount: number;
  }): Promise<void> {
    await this.deferredWorkspaceOperationRunnerService.updateInProgressOperationPayload(
      {
        workspaceId,
        name: COMPUTE_OPERATION_NAME,
        updatePayload: (payload) => ({
          ...payload,
          computedRecordCount: payload.computedRecordCount + recordCount,
        }),
      },
    );
  }

  async resetComputedRecordCount(workspaceId: string): Promise<void> {
    await this.deferredWorkspaceOperationRunnerService.updateInProgressOperationPayload(
      {
        workspaceId,
        name: COMPUTE_OPERATION_NAME,
        updatePayload: (payload) => ({ ...payload, computedRecordCount: 0 }),
      },
    );
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
    const sumRecordCounts = (
      key: 'plannedRecordCount' | 'computedRecordCount',
    ): number =>
      computePayloads.reduce(
        (recordCount, payload) => recordCount + payload[key],
        0,
      );
    const computedRecordCount = sumRecordCounts('computedRecordCount');
    const totalRecordCount = Math.max(
      sumRecordCounts('plannedRecordCount'),
      computedRecordCount,
    );

    return {
      totalRecordCount,
      remainingRecordCount: totalRecordCount - computedRecordCount,
      isInProgress: isNonEmptyArray(computePayloads),
    };
  }
}
