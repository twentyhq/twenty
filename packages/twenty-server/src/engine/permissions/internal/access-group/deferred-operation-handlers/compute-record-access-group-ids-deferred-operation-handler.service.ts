/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AccessGroupPropagationPlanService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-plan.service';
import { RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { DeferredWorkspaceOperationHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/decorators/deferred-workspace-operation-handler.decorator';
import { type DeferredWorkspaceOperationHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/interfaces/deferred-workspace-operation-handler.interface';
import { type DeferredWorkspaceOperationExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-execution-args.type';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

@Injectable()
@DeferredWorkspaceOperationHandlerDecorator('compute_recordAccessGroupIds')
export class ComputeRecordAccessGroupIdsDeferredOperationHandlerService implements DeferredWorkspaceOperationHandler<'compute_recordAccessGroupIds'> {
  readonly metadataNamesToLoad = ['objectMetadata' as const];

  constructor(
    private readonly recordAccessGroupComputationService: RecordAccessGroupComputationService,
    private readonly accessGroupPropagationPlanService: AccessGroupPropagationPlanService,
  ) {}

  async execute({
    workspaceId,
    payload: { objectComputes },
  }: DeferredWorkspaceOperationExecutionArgs<
    DeferredWorkspaceOperationPayload<'compute_recordAccessGroupIds'>
  >): Promise<void> {
    for (const {
      objectMetadataId,
      accessGroupIdChanges,
      afterRecordId = null,
      isComputed,
    } of objectComputes) {
      if (isComputed) {
        continue;
      }

      if (isDefined(accessGroupIdChanges)) {
        await this.recordAccessGroupComputationService.recomputeRecordAccessGroupIdsAffectedByAccessGroupIdChanges(
          {
            workspaceId,
            objectMetadataId,
            afterRecordId,
            ...accessGroupIdChanges,
          },
        );
      } else {
        await this.recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfAllObjectRecords(
          { workspaceId, objectMetadataId, afterRecordId },
        );
      }
      await this.accessGroupPropagationPlanService.completeNextObjectCompute(
        workspaceId,
      );
    }
  }
}
