import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { hasWorkflowOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/has-workflow-output-schema.util';

export const hasWorkflowStepLevelOutputSchema = (
  step: WorkflowAction,
): boolean => {
  return hasWorkflowOutputSchema(step.settings);
};
