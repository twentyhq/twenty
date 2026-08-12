import {
  TRIGGER_STEP_ID,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { hasOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/has-output-schema.util';
import { buildMissingOutputSchemaIssue } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/build-missing-output-schema-issue.util';

export const validateTriggerTypeRequirements = (
  trigger: WorkflowTrigger | null,
): WorkflowValidationIssue[] => {
  if (trigger?.type !== WorkflowTriggerType.WEBHOOK) {
    return [];
  }

  if (hasOutputSchema(trigger.settings)) {
    return [];
  }

  return [
    buildMissingOutputSchemaIssue({
      id: TRIGGER_STEP_ID,
      name: trigger.name,
    }),
  ];
};
