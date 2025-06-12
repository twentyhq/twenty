import { Injectable } from '@nestjs/common';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';

import { isWorkflowAiAgentAction } from './guards/is-workflow-ai-agent-action.guard';
import { WorkflowAiAgentActionInput } from './types/workflow-ai-agent-action-input.type';

@Injectable()
export class AiAgentWorkflowAction implements WorkflowExecutor {
  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowExecutorInput): Promise<WorkflowExecutorOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }
    if (!isWorkflowAiAgentAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an AI Agent action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowAiAgentActionInput;

    const { modelProvider, model, prompt, responseFormat } =
      workflowActionInput;

    try {
      // TODO: Implement AI agent execution
      // This will involve:
      // 1. Calling the appropriate AI model API based on modelProvider (openai/anthropic)
      // 2. Using the specific model from that provider
      // 3. Passing the prompt and response format
      // 4. Handling the response and any errors
      // 5. Returning the result in the expected format

      // For now, return a placeholder response
      return {
        result: {
          message: 'AI Agent execution not yet implemented',
          input: workflowActionInput,
        },
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'AI Agent execution failed',
      };
    }
  }
}
