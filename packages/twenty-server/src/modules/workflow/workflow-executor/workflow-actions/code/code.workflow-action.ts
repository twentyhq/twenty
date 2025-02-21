import { Injectable } from '@nestjs/common';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';
import { WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';

@Injectable()
export class CodeWorkflowAction implements WorkflowExecutor {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute(
    workflowActionInput: WorkflowCodeActionInput,
  ): Promise<WorkflowExecutorOutput> {
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
        return { error: result.error.errorMessage };
      }

      return { result: result.data || {} };
    } catch (error) {
      return { error: error.message };
    }
  }
}
