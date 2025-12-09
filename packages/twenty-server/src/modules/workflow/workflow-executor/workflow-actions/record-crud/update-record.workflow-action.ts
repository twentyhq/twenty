import { Injectable } from '@nestjs/common';

import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowUpdateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-update-record-action.guard';
import { type WorkflowUpdateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class UpdateRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly updateRecordService: UpdateRecordService,
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

    if (!isWorkflowUpdateRecordAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an update record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowUpdateRecordActionInput;

    if (
      !isDefined(workflowActionInput.objectRecordId) ||
      !isValidUuid(workflowActionInput.objectRecordId) ||
      !isDefined(workflowActionInput.objectName)
    ) {
      throw new RecordCrudException(
        'Failed to update: Object record ID and name are required',
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }

    const { workspaceId } = runInfo;

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const toolOutput = await this.updateRecordService.execute({
      objectName: workflowActionInput.objectName,
      objectRecordId: workflowActionInput.objectRecordId,
      objectRecord: workflowActionInput.objectRecord,
      fieldsToUpdate: workflowActionInput.fieldsToUpdate,
      workspaceId,
      rolePermissionConfig: executionContext.rolePermissionConfig,
    });

    if (!toolOutput.success) {
      throw new RecordCrudException(
        toolOutput.error || toolOutput.message,
        RecordCrudExceptionCode.RECORD_UPDATE_FAILED,
      );
    }

    return {
      result: toolOutput.result,
    };
  }
}
