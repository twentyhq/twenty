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
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { type WorkflowCreateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class CreateRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly createRecordService: CreateRecordService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
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

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const createdBy = this.buildCreatedByActor(executionContext);

    const toolOutput = await this.createRecordService.execute({
      objectName: workflowActionInput.objectName,
      objectRecord: workflowActionInput.objectRecord,
      workspaceId,
      createdBy,
      roleContext: { roleId: executionContext.roleId },
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

  private buildCreatedByActor(
    executionContext: WorkflowExecutionContext,
  ): ActorMetadata {
    if (executionContext.isActingOnBehalfOfUser) {
      return executionContext.initiator;
    }

    return {
      source: FieldActorSource.WORKFLOW,
      name: 'Workflow',
      workspaceMemberId: null,
      context: {},
    };
  }
}
