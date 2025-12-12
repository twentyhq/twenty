import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/guards/is-workflow-code-action.guard';
import { type WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';

@Injectable()
export class CodeWorkflowAction implements WorkflowAction {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

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
      const { workspaceId } = runInfo;

      const result =
        await this.serverlessFunctionService.executeOneServerlessFunction({
          id: workflowActionInput.serverlessFunctionId,
          workspaceId,
          payload: workflowActionInput.serverlessFunctionInput,
          version: workflowActionInput.serverlessFunctionVersion,
        });

      if (result.error) {
        return { error: result.error.errorMessage };
      }

      return { result: result.data || {} };
    } catch (error) {
      return { error: error.message };
    }
  }
}
