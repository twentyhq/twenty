import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowFindRecordsAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-find-records-action.guard';
import { type WorkflowFindRecordsActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class FindRecordsWorkflowAction implements WorkflowAction {
  constructor(
    private readonly findRecordsService: FindRecordsService,
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

    if (!isWorkflowFindRecordsAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a find records action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowFindRecordsActionInput;

    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new RecordCrudException(
        'Failed to read: Workspace ID is required',
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const toolOutput = await this.findRecordsService.execute({
      objectName: workflowActionInput.objectName,
      filter: workflowActionInput.filter?.gqlOperationFilter,
      orderBy: workflowActionInput.orderBy?.gqlOperationOrderBy,
      limit: workflowActionInput.limit,
      workspaceId,
      rolePermissionConfig: executionContext.rolePermissionConfig,
    });

    if (!toolOutput.success) {
      throw new RecordCrudException(
        toolOutput.error || toolOutput.message,
        RecordCrudExceptionCode.QUERY_FAILED,
      );
    }

    const records = toolOutput.result?.records ?? [];
    const totalCount = toolOutput.result?.count ?? 0;

    return {
      result: {
        first: records[0],
        all: records,
        totalCount,
      },
    };
  }
}
