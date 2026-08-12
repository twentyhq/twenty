import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const validateAiAgentStep = (
  step: WorkflowAiAgentAction,
): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];

  if (!isNonEmptyString(step.settings?.input?.agentId)) {
    issues.push({
      severity: 'error',
      code: 'AI_AGENT_MISSING_AGENT',
      message: `AI Agent step "${step.name ?? step.id}" has no agent selected.`,
      stepId: step.id,
    });
  }

  const outputSchema = step.settings?.outputSchema;
  const hasOutputSchema =
    isDefined(outputSchema) && Object.keys(outputSchema).length > 0;

  if (!hasOutputSchema) {
    issues.push({
      severity: 'warning',
      code: 'AI_AGENT_MISSING_OUTPUT_VARIABLE',
      message: `AI Agent step "${step.name ?? step.id}" has no output variable defined. Downstream steps won't be able to reference its result.`,
      stepId: step.id,
    });
  }

  return issues;
};
