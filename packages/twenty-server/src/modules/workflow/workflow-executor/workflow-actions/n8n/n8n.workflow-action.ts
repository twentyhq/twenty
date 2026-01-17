import { Injectable, Logger } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';

import { isWorkflowN8nAction } from './guards/is-workflow-n8n-action.guard';

@Injectable()
export class N8nWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(N8nWorkflowAction.name);

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((s) => s.id === currentStepId);

    if (!step) {
      return {
        error: `Step ${currentStepId} not found`,
      };
    }

    if (!isWorkflowN8nAction(step)) {
      return {
        error: `Step ${currentStepId} is not an n8n action`,
      };
    }

    const { webhookUrl, payload } = step.settings.input;

    if (!webhookUrl) {
      return {
        error: 'Webhook URL is required',
      };
    }

    const resolvedPayload = payload
      ? (resolveInput(payload, context) as Record<string, unknown>)
      : {};

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resolvedPayload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      this.logger.log(
        `n8n webhook triggered: ${webhookUrl} - Status: ${response.status}`,
      );

      return {
        result: {
          triggered: true,
          statusCode: response.status,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`n8n webhook failed: ${webhookUrl} - ${errorMessage}`);

      return {
        error: `Failed to trigger n8n workflow: ${errorMessage}`,
      };
    }
  }
}
