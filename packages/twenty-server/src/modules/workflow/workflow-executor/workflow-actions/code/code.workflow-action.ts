import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';

@Injectable()
export class CodeWorkflowAction implements WorkflowAction {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute(
    workflowActionInput: WorkflowCodeActionInput,
  ): Promise<WorkflowActionResult> {
    try {
      const { workspaceId } = this.scopedWorkspaceContextFactory.create();

      if (!workspaceId) {
        throw new WorkflowStepExecutorException(
          'Scoped workspace not found',
          WorkflowStepExecutorExceptionCode.SCOPED_WORKSPACE_NOT_FOUND,
        );
      }

      const result =
        await this.serverlessFunctionService.executeOneServerlessFunction(
          workflowActionInput.serverlessFunctionId,
          workspaceId,
          workflowActionInput.serverlessFunctionInput,
          workflowActionInput.serverlessFunctionVersion,
        );

      if (result.error) {
        return { error: result.error };
      }

      return { result: result.data || {} };
    } catch (error) {
      return { error: error.message };
    }
  }
}
