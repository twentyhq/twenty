import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { isWorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/guards/is-workflow-code-action.guard';
import { WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';

@Injectable()
export class CodeWorkflowAction implements WorkflowAction {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
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

    if (!isWorkflowCodeAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a code action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowCodeActionInput;

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
