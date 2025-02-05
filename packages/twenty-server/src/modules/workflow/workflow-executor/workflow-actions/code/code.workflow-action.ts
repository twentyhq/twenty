import { Injectable } from '@nestjs/common';

import { WorkflowCodeActionInput, WorkflowActionResult } from 'twenty-shared';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

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
