/* @license Enterprise */

import { Injectable } from '@nestjs/common';

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
    payload: { objectMetadataId },
  }: DeferredWorkspaceOperationExecutionArgs<
    DeferredWorkspaceOperationPayload<'compute_recordAccessGroupIds'>
  >): Promise<void> {
    await this.accessGroupPropagationPlanService.resetComputedRecordCount(
      workspaceId,
    );
    await this.recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfAllObjectRecords(
      { workspaceId, objectMetadataId },
    );
  }
}
