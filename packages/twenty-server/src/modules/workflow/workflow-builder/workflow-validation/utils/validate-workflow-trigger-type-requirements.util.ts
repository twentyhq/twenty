import {
  TRIGGER_STEP_ID,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { hasWorkflowOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/has-workflow-output-schema.util';
import { buildMissingWorkflowOutputSchemaIssue } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/build-missing-workflow-output-schema-issue.util';

export const validateWorkflowTriggerTypeRequirements = (
  trigger: WorkflowTrigger | null,
): WorkflowValidationIssue[] => {
  if (trigger?.type !== WorkflowTriggerType.WEBHOOK) {
    return [];
  }

  if (hasWorkflowOutputSchema(trigger.settings)) {
    return [];
  }

  return [
    buildMissingWorkflowOutputSchemaIssue({
      id: TRIGGER_STEP_ID,
      name: trigger.name,
    }),
  ];
};
