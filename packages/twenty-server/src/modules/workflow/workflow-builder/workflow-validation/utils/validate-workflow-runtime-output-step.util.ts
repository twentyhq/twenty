import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { hasWorkflowStepLevelOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/has-workflow-step-level-output-schema.util';
import { buildMissingWorkflowOutputSchemaIssue } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/build-missing-workflow-output-schema-issue.util';

export const validateWorkflowRuntimeOutputStep = (
  step: WorkflowAction,
): WorkflowValidationIssue[] => {
  if (hasWorkflowStepLevelOutputSchema(step)) {
    return [];
  }

  return [
    buildMissingWorkflowOutputSchemaIssue({ id: step.id, name: step.name }),
  ];
};
