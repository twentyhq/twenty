import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { isValidUuid, resolveInput } from 'twenty-shared/utils';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { isWorkflowDeleteRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-delete-record-action.guard';
import { WorkflowDeleteRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class DeleteRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }
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
        'Failed to update: Object record ID and name are required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new RecordCRUDActionException(
        'Failed to delete: Workspace ID is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        workflowActionInput.objectName,
        { shouldBypassPermissionChecks: true },
      );

    const objectRecord = await repository.findOne({
      where: {
        id: workflowActionInput.objectRecordId,
      },
    });

    if (!objectRecord) {
      throw new RecordCRUDActionException(
        `Failed to delete: Record ${workflowActionInput.objectName} with id ${workflowActionInput.objectRecordId} not found`,
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    await repository.softDelete(workflowActionInput.objectRecordId);

    return {
      result: objectRecord,
    };
  }
}
