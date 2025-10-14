import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import {
  type ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { type WorkflowCreateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class CreateRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly createRecordService: CreateRecordService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      steps,
      stepId: currentStepId,
    });

    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new RecordCrudException(
        'Failed to create: Workspace ID is required',
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowCreateRecordActionInput;

    const createdBy = await this.buildCreatedByActor(runInfo);

    const toolOutput = await this.createRecordService.execute({
      objectName: workflowActionInput.objectName,
      objectRecord: workflowActionInput.objectRecord,
      workspaceId,
      createdBy,
    });

    if (!toolOutput.success) {
      throw new RecordCrudException(
        toolOutput.error || toolOutput.message,
        RecordCrudExceptionCode.RECORD_CREATION_FAILED,
      );
    }

    return {
      result: toolOutput.result,
    };
  }

  private async buildCreatedByActor(runInfo: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<ActorMetadata> {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId: runInfo.workflowRunId,
        workspaceId: runInfo.workspaceId,
      });

    if (workflowRun.createdBy.source === FieldActorSource.MANUAL) {
      return workflowRun.createdBy;
    }

    return {
      source: FieldActorSource.WORKFLOW,
      name: 'Workflow',
      workspaceMemberId: null,
      context: {},
    };
  }
}
