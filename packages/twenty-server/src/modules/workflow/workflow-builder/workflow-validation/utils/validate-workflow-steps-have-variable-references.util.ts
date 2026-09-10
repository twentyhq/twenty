import {
  extractVariablesFromInput,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WORKFLOW_VARIABLE_CONSUMING_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/workflow-variable-consuming-action-types.constant';

export const validateWorkflowStepsHaveVariableReferences = (
  steps: WorkflowAction[],
): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];

  for (const step of steps) {
    if (!WORKFLOW_VARIABLE_CONSUMING_ACTION_TYPES.has(step.type)) {
      continue;
    }

    const variables = extractVariablesFromInput(step.settings?.input);

    if (variables.length > 0) {
      continue;
    }

    issues.push({
      severity: 'warning',
      code: 'STEP_HAS_NO_VARIABLE_REFERENCE',
      message: `Step "${step.name ?? step.id}" does not reference any variable from previous steps.`,
      stepId: step.id,
    });
  }

  return issues;
};
