import { Injectable } from '@nestjs/common';

import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { isWorkflowDeleteRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-delete-record-action.guard';
import { type WorkflowDeleteRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class DeleteRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly deleteRecordService: DeleteRecordService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      steps,
      stepId: currentStepId,
    });

    if (!isWorkflowDeleteRecordAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a delete record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowDeleteRecordActionInput;

    if (
      !isDefined(workflowActionInput.objectRecordId) ||
      !isValidUuid(workflowActionInput.objectRecordId) ||
      !isDefined(workflowActionInput.objectName)
    ) {
      throw new RecordCRUDActionException(
        'Failed to delete: Object record ID and name are required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new RecordCRUDActionException(
        'Failed to delete: Workspace ID is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const toolOutput = await this.deleteRecordService.execute({
      objectName: workflowActionInput.objectName,
      objectRecordId: workflowActionInput.objectRecordId,
      workspaceId,
      soft: true,
    });

    if (!toolOutput.success) {
      throw new RecordCRUDActionException(
        toolOutput.error || toolOutput.message,
        RecordCRUDActionExceptionCode.RECORD_DELETION_FAILED,
      );
    }

    return {
      result: toolOutput.result as object,
    };
  }
}
