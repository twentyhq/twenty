import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { hasStepLevelOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/has-step-level-output-schema.util';
import { buildMissingOutputSchemaIssue } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/build-missing-output-schema-issue.util';

export const validateRuntimeOutputStep = (
  step: WorkflowAction,
): WorkflowValidationIssue[] => {
  if (hasStepLevelOutputSchema(step)) {
    return [];
  }

  return [buildMissingOutputSchemaIssue({ id: step.id, name: step.name })];
};
