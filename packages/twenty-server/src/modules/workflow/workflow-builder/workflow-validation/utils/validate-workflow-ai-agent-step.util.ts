import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  hasWorkflowAiAgentInlineConfig,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const validateWorkflowAiAgentStep = (
  step: WorkflowAiAgentAction,
): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];

  const input = step.settings?.input;
  const stepLabel = step.name ?? step.id;

  if (
    isNonEmptyString(input?.agentId) &&
    hasWorkflowAiAgentInlineConfig(input)
  ) {
    issues.push({
      severity: 'error',
      code: 'AI_AGENT_CONFLICTING_CONFIG',
      message: `Agent step "${stepLabel}" runs an agent, so its instructions, model and permissions come from the agent.`,
      stepId: step.id,
    });
  }

  if (
    !isNonEmptyString(input?.agentId) &&
    !isNonEmptyString(input?.instructions?.trim()) &&
    !isNonEmptyString(input?.prompt?.trim())
  ) {
    issues.push({
      severity: 'error',
      code: 'AI_AGENT_MISSING_INSTRUCTIONS',
      message: `Agent step "${stepLabel}" has no instructions or prompt.`,
      stepId: step.id,
    });
  }

  const outputSchema = step.settings?.outputSchema;
  const hasWorkflowOutputSchema =
    isDefined(outputSchema) && Object.keys(outputSchema).length > 0;

  if (!hasWorkflowOutputSchema) {
    issues.push({
      severity: 'warning',
      code: 'AI_AGENT_MISSING_OUTPUT_VARIABLE',
      message: `Agent step "${stepLabel}" has no output variable defined. Downstream steps won't be able to reference its result.`,
      stepId: step.id,
    });
  }

  return issues;
};
