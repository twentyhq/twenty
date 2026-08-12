import {
  extractVariablesFromInput,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { VARIABLE_CONSUMING_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/variable-consuming-action-types.constant';

export const validateStepsHaveVariableReferences = (
  steps: WorkflowAction[],
): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];

  for (const step of steps) {
    if (!VARIABLE_CONSUMING_ACTION_TYPES.has(step.type)) {
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
