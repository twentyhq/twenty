/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { DeferredWorkspaceOperationEntity } from 'src/engine/metadata-modules/deferred-workspace-operation/deferred-workspace-operation.entity';
import { DeferredWorkspaceOperationQueueService } from 'src/engine/metadata-modules/deferred-workspace-operation/services/deferred-workspace-operation-queue.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';
import { areRecordAccessGroupComputesAlreadyPlanned } from 'src/engine/permissions/internal/access-group/utils/are-record-access-group-computes-already-planned.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';
import { type DeferredWorkspaceOperationStatus } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-status.type';

const COMPUTE_OPERATION_NAME = 'compute_recordAccessGroupIds';

type ComputeOperationPayload = DeferredWorkspaceOperationPayload<
  typeof COMPUTE_OPERATION_NAME
>;

@Injectable()
export class AccessGroupPropagationPlanService {
  constructor(
    @InjectWorkspaceScopedRepository(DeferredWorkspaceOperationEntity)
    private readonly deferredWorkspaceOperationRepository: WorkspaceScopedRepository<DeferredWorkspaceOperationEntity>,
    private readonly deferredWorkspaceOperationQueueService: DeferredWorkspaceOperationQueueService,
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

    const waitingComputePayloads = await this.findComputePayloads({
      workspaceId,
      statuses: ['PENDING'],
    });

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

    await this.deferredWorkspaceOperationQueueService.persistAndEnqueue({
      workspaceId,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
      deferredOperations: plannedObjectMetadataIds.map((objectMetadataId) => ({
        name: COMPUTE_OPERATION_NAME,
        payload: {
          objectMetadataId,
          plannedRecordCount:
            recordCountByObjectMetadataId.get(objectMetadataId) ?? 0,
          computedRecordCount: 0,
        },
      })),
    });
  }

  async trackComputedRecords({
    workspaceId,
    recordCount,
  }: {
    workspaceId: string;
    recordCount: number;
  }): Promise<void> {
    await this.updateRunningComputedRecordCount({
      workspaceId,
      computedRecordCountExpression: `("payload"->>'computedRecordCount')::integer + :recordCount`,
      parameters: { recordCount },
    });
  }

  async resetComputedRecordCount(workspaceId: string): Promise<void> {
    await this.updateRunningComputedRecordCount({
      workspaceId,
      computedRecordCountExpression: '0',
      parameters: {},
    });
  }

  async findProgress(
    workspaceId: string,
  ): Promise<AccessGroupPropagationProgress> {
    const computePayloads = await this.findComputePayloads({
      workspaceId,
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

  private async findComputePayloads({
    workspaceId,
    statuses,
  }: {
    workspaceId: string;
    statuses: DeferredWorkspaceOperationStatus[];
  }): Promise<ComputeOperationPayload[]> {
    const computeOperations =
      await this.deferredWorkspaceOperationRepository.find(workspaceId, {
        where: { name: COMPUTE_OPERATION_NAME, status: In(statuses) },
        order: { createdAt: 'ASC', position: 'ASC' },
      });

    return computeOperations.map(
      ({ payload }) => payload as ComputeOperationPayload,
    );
  }

  private async updateRunningComputedRecordCount({
    workspaceId,
    computedRecordCountExpression,
    parameters,
  }: {
    workspaceId: string;
    computedRecordCountExpression: string;
    parameters: Record<string, number>;
  }): Promise<void> {
    await this.deferredWorkspaceOperationRepository
      .createQueryBuilder()
      .update()
      .set({
        payload: () =>
          `jsonb_set("payload", '{computedRecordCount}', to_jsonb(${computedRecordCountExpression}))`,
        startedAt: () => 'now()',
      })
      .where({
        workspaceId,
        name: COMPUTE_OPERATION_NAME,
        status: 'IN_PROGRESS',
      })
      .setParameters(parameters)
      .execute();
  }
}
