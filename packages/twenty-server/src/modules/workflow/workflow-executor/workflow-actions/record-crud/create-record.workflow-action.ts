import { Injectable } from '@nestjs/common';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowCreateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

import { RecordCrudWorkflowActionBase } from './record-crud-workflow-action-base';

@Injectable()
export class CreateRecordWorkflowAction extends RecordCrudWorkflowActionBase {
  constructor(
    twentyORMGlobalManager: TwentyORMGlobalManager,
    scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    recordInputTransformerService: RecordInputTransformerService,
    recordPositionService: RecordPositionService,
  ) {
    super(
      twentyORMGlobalManager,
      scopedWorkspaceContextFactory,
      workflowCommonWorkspaceService,
      recordInputTransformerService,
      recordPositionService,
    );
  }

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = await this.findStepOrThrowSafe(steps, currentStepId);
    const workspaceId = await this.getWorkspaceId();
    const workflowActionInput =
      this.resolveInputSafe<WorkflowCreateRecordActionInput>(
        step.settings.input as Record<string, unknown>,
        context,
      );

    const { repository, objectMetadataItemWithFieldsMaps } =
      await this.getRepositoryAndMetadata(
        workspaceId,
        workflowActionInput.objectName,
      );

    const createdRecord = await this.createRecord(
      repository,
      workflowActionInput.objectRecord,
      objectMetadataItemWithFieldsMaps,
      workspaceId,
    );

    return {
      result: createdRecord,
    };
  }
}
