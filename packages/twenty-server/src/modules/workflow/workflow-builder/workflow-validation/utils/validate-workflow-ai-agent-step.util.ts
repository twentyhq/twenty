import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  getWorkflowAiAgentStepConfigIssues,
  isWorkflowAiAgentGenerateStep,
  WORKFLOW_AI_AGENT_STEP_CONFIG_ISSUE_MESSAGES,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const validateWorkflowAiAgentStep = (
  step: WorkflowAiAgentAction,
): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];

  const input = step.settings?.input;
  const stepLabel = step.name ?? step.id;
  const isGenerateStep = isWorkflowAiAgentGenerateStep(input ?? {});

  for (const issueCode of getWorkflowAiAgentStepConfigIssues({
    hasAgent: !isGenerateStep,
    input: input ?? {},
  })) {
    issues.push({
      severity: 'error',
      code: 'AI_AGENT_CONFLICTING_CONFIG',
      message: `Agent step "${stepLabel}": ${WORKFLOW_AI_AGENT_STEP_CONFIG_ISSUE_MESSAGES[issueCode]}`,
      stepId: step.id,
    });
  }

  if (isGenerateStep && !isNonEmptyString(input?.prompt?.trim())) {
    issues.push({
      severity: 'error',
      code: 'AI_AGENT_MISSING_PROMPT',
      message: `Agent step "${stepLabel}" has no prompt.`,
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
