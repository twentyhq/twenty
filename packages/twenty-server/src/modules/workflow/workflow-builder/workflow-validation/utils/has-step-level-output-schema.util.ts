import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { hasOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/has-output-schema.util';

export const hasStepLevelOutputSchema = (step: WorkflowAction): boolean => {
  return hasOutputSchema(step.settings);
};
